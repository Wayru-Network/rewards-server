import { ConsumeMessage } from "amqplib";
import { processWubiRabbitResponse } from "./process-wubi-response.service";
import { processWupiRabbitResponse } from "./process-wupi-response.service";

export const runTestRabbitConsumers = async () => {
    // Test Wubi message
    const payloadTest = {
        wayru_device_id: "321654",
        epoch_id: 23,
        last_item: true,
        hotspot_score: 1,
    };
    const message = JSON.stringify(payloadTest);
    const messageBuffer = Buffer.from(message);
    const consumeMessage = {
        content: messageBuffer,
    } as ConsumeMessage;
    console.log("Testing Wubi message");
    await processWubiRabbitResponse(consumeMessage).catch((error) => {
        console.error("error testing wubi message", error);
    });

    /* Test Wupi message
    const payloadTestWupi = {
        nas_id: "00:00:00:00:00:00",
        nfnode_id: 67,
        epoch: "03/03/2025",
        total_valid_nas: 100,
        score: "1000000000000000000",
    };
    const messageWupi = JSON.stringify(payloadTestWupi);
    const messageBufferWupi = Buffer.from(messageWupi);
    const consumeMessageWupi = {
        content: messageBufferWupi,
    } as ConsumeMessage;
    console.log("Testing Wupi message");
    await processWupiRabbitResponse(consumeMessageWupi).catch((error) => {
        console.error("error testing wupi message", error);
    }); */
};
