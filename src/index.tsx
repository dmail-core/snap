import type { OnRpcRequestHandler, OnCronjobHandler } from '@metamask/snaps-sdk';
import { Box, Text, Bold, Heading } from '@metamask/snaps-sdk/jsx';

import { DmailAi, MaxTitleSize, MaxContentSize, dealTo } from './utils'

export const onCronjob: OnCronjobHandler = async ({ request }) => {
  switch (request.method) {
    case "execute":
      const storedData = await snap.request({
        method: "snap_manageState",
        params: { operation: "get" },
      })

      const storedKeys = Array.isArray(storedData?.keys) ? storedData?.keys : []
      if (storedKeys.length) {
        const sKeys = storedKeys.join('_')
        const response = await fetch(`https://icp.dmail.ai/dmailServer/api/snap/getMessageList?keys=${sKeys}`);
        const res = await response.json();
  
        // Cron jobs can execute any method that is available to the Snap.
        if (res?.success && Array.isArray(res?.data) && res.data.length) {
          // const { data: { message_count } } = res
          const emails = res.data.slice(0, 5)
          while (emails.length) {
            const { sender, recipient, subject, content } = emails.shift()
            
            if (typeof content !== 'string') {
              continue 
            }

            const title = subject.length > MaxTitleSize ? `${subject.substring(0, MaxTitleSize)}...` : subject
            const message = content.length > MaxContentSize ? `${content.substring(0, MaxContentSize)}...` : content
            const me = recipient.includes(DmailAi) ? dealTo(recipient) : recipient

            await snap.request({
              method: "snap_notify",
              params: {
                type: "inApp",
                message: `${sender} sent You(${me}) an email`,
                title,
                content: (
                  <Box>
                    <Text><Bold>Content:</Bold></Text>
                    <Text>{message}</Text>
                  </Box>
                ),
                footerLink: {
                  href: "https://mail.dmail.ai/inbox",
                  text: "Reply",
                },
              },
            })
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      }
      
    default:
      throw new Error("Method not found.");
  }
};

export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  switch (request.method) {
    case 'bind':
      if (request?.params && 'key' in request?.params) {
        const key = request?.params?.key
        const storedData = await snap.request({
          method: "snap_manageState",
          params: { operation: "get" },
        })
        if (!storedData || !Array.isArray(storedData?.keys) || !storedData?.keys.includes(key)) {
          const storedKeys = storedData && Array.isArray(storedData?.keys) ? storedData.keys : []
          await snap.request({
            method: "snap_manageState",
            params: {
              operation: "update",
              newState: { ...storedData, keys: [...storedKeys, key] },
            },
          })
        }
      }
      return true
    case "sendNotification":
      await snap.request({
        method: "snap_notify",
        params: {
          type: "inApp",
          message: "This is a message!",
          title: "This is a title",
          content: (
            <Box>
              <Heading>Here is content!</Heading>
              <Text>This is a notification sent from a Dmail.</Text>
            </Box>
          ),
          footerLink: { 
            href: "https://snaps.metamask.io",
            text: "Jump",
          },
        },
      });
      return "send successful!";
    default:
      throw new Error('Method not found.');
  }
};
