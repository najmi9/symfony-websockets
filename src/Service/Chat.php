<?php

declare(strict_types=1);

namespace App\Service;

use Ratchet\ConnectionInterface;
use Ratchet\MessageComponentInterface;

class Chat implements MessageComponentInterface
{
    private const JOIN = 'join';

    private const MSG = 'msg';

    private const PUSH = 'push';

    protected array $clients;

    public function __construct()
    {
        $this->clients = [];
    }

    public function onOpen(ConnectionInterface $conn): void
    {
        // check the limit of connection for example
        // dump("New connection with ID ({$conn->resourceId})");
    }

    public function onMessage(ConnectionInterface $from, $msg)
    {
        
        $data = json_decode($msg, true);

        if (self::JOIN === $data['type']) {
            // check if already exists
            // the user should be validated
    
            foreach ($this->clients as $userId => $client) {
                $pushMessage = [
                    'user' => $data['user'],
                    'type' => self::PUSH,
                    'msg' => 'push user'
                ];
                $client->send(json_encode($pushMessage));

            }
            $this->clients[$data['user']['id']] = $from;

           /*  $alreadyExists = $this->clients[$data['user']['id']] ?? null;
            if (null === $alreadyExists) {
            } */
        }

        if (self::MSG === $data['type']) {
            foreach ($this->clients as $id => $client) {
                if ($from !== $client && $id == $data['to']['id']) {
                    dump('send message to ' . $data['user']['username']);
                    $client->send($msg);
                }
            }
        }
    }

    public function onClose(ConnectionInterface $conn)
    {
        // $this->clients->detach($conn);
    }

    public function onError(ConnectionInterface $conn, \Exception $e)
    {
        $conn->close();
    }
}