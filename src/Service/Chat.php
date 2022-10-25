<?php

declare(strict_types=1);

namespace App\Service;

use Ratchet\ConnectionInterface;
use Ratchet\MessageComponentInterface;
use UnexpectedValueException;

class Chat implements MessageComponentInterface
{
    private const USER_JOINED = 'USER_JOINED';

    private const NEW_MESSAGE = 'NEW_MESSAGE';

    private const NEW_CONVERSATION = 'NEW_CONVERSATION';

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

        $type = $data['type'] ?? null;

        if (null === $type) {
            throw new UnexpectedValueException('"type" required in the message body');
        }

        switch ($type) {
            case self::USER_JOINED:
                foreach ($this->clients as $userId => $client) {
                    $pushMessage = [
                        'user' => $data['user'],
                        'type' => self::USER_JOINED,
                        'msg' => 'push user',
                    ];
                    $client->send(json_encode($pushMessage));
                }

                $this->clients["{$data['user']['id']}"] = $from;
            case self::NEW_MESSAGE:
                $sendTo = $data['to']['id'] ?? null;
                $client = $this->clients["{$sendTo}"] ?? null;

                if (null === $client) {
                    throw new UnexpectedValueException("participant with ID {$sendTo} does not exists");
                }

                $client->send($msg);
            case self::NEW_CONVERSATION:
                $participant = $data['participant']['id'] ?? null;
                $client = $this->clients["{$participant}"] ?? null;

                if (null === $client) {
                    throw new UnexpectedValueException("participant with ID {$participant} does not exists");
                }

                $client->send($msg);
            default:
                throw new UnexpectedValueException("Unexpected type '{$type}'", 1);
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