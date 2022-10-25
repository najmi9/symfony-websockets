<?php

declare(strict_types=1);

namespace App\Service;

use Ratchet\ConnectionInterface;
use Ratchet\MessageComponentInterface;

class Chat implements MessageComponentInterface
{
    private const JOIN = 'USER_JOINED';

    private const MSG = 'NEW_MESSAGE';

    private const CONV = 'NEW_CONVERSATION';

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
            foreach ($this->clients as $userId => $client) {
                $pushMessage = [
                    'user' => $data['user'],
                    'type' => self::JOIN,
                    'msg' => 'push user'
                ];
                
                $client->send(json_encode($pushMessage));
            }

            $this->clients["{$data['user']['id']}"] = $from;
        }

        if (self::MSG === $data['type']) {
            $client = $this->clients["{$data['to']['id']}"];

            $client->send($msg);
        }

        if (self::CONV === $data['type']) {
            $client = $this->clients["{$data['participant']['id']}"];
            $client->send($msg);
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