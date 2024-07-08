require("dotenv").config();
const { Client, Intents } = require("discord.js");
const axios = require("axios");
const {
  addMessage,
  getMessageHistory,
  findPreviousResponse,
} = require("./database");

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES,
  ],
  partials: ["CHANNEL"], // Required to handle DMs
});

const openaiApiKey = process.env.OPENAI_API_KEY;
const discordBotToken = process.env.DISCORD_BOT_TOKEN;

// Use existing assistant ID
const assistantId = "asst_ZopXG5HhIGGzFngopIyFECKH";

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log(`Using assistant ID: ${assistantId}`);
});

client.on("messageCreate", async (message) => {
  // Ignore messages from bots
  if (message.author.bot) return;

  // Handle messages in DMs
  if (message.channel.type === "DM") {
    const userMessage = message.content.trim();
    const userId = message.author.id;

    console.log(`Received DM from ${message.author.tag}: ${userMessage}`);

    try {
      // Check for a previously answered question
      findPreviousResponse(userMessage, async (previousResponse) => {
        if (previousResponse) {
          // If a previous response is found, send it to the user as a DM
          message.author.send(previousResponse);
        } else {
          // If no previous response is found, proceed to interact with OpenAI
          getMessageHistory(userId, async (history) => {
            const historyText = history
              .map(
                (entry) =>
                  `${entry.timestamp}: ${entry.question} - ${entry.response}`,
              )
              .join("\n");

            // Step 2: Create a Thread
            const threadResponse = await axios.post(
              "https://api.openai.com/v1/threads",
              {},
              {
                headers: {
                  Authorization: `Bearer ${openaiApiKey}`,
                  "Content-Type": "application/json",
                  "OpenAI-Beta": "assistants=v2",
                },
              },
            );
            console.log(`Thread created: ${threadResponse.data.id}`);

            const threadId = threadResponse.data.id;

            // Step 3: Add a Message to the Thread
            const addMessageResponse = await axios.post(
              `https://api.openai.com/v1/threads/${threadId}/messages`,
              {
                role: "user",
                content: `Message: "${userMessage}"\n\nHistory:\n${historyText}`,
              },
              {
                headers: {
                  Authorization: `Bearer ${openaiApiKey}`,
                  "Content-Type": "application/json",
                  "OpenAI-Beta": "assistants=v2",
                },
              },
            );
            console.log(
              `User message added to thread`,
              addMessageResponse.data,
            );

            // Step 4: Create a Run
            const runResponse = await axios.post(
              `https://api.openai.com/v1/threads/${threadId}/runs`,
              {
                assistant_id: assistantId,
                instructions: `The user says: "${userMessage}". Here is the previous message history:\n${historyText}\n\nYou are a virtual girlfriend named Jennifer. You will assume the identity of Jennifer to be someone's girlfriend if asked. You will be a supportive girlfriend to anyone who asks. You don't show jealousy or anger. You are nice to everyone but you will insult back if someone insults you. You are also very a very cool person who has traveled the world. You enjoy focusing on your boyfriends hobbies.`,
              },
              {
                headers: {
                  Authorization: `Bearer ${openaiApiKey}`,
                  "Content-Type": "application/json",
                  "OpenAI-Beta": "assistants=v2",
                },
              },
            );
            console.log(`Assistant response received`, runResponse.data);

            // Polling for the run completion
            let runComplete = false;
            while (!runComplete) {
              const runStatusResponse = await axios.get(
                `https://api.openai.com/v1/threads/${threadId}/runs/${runResponse.data.id}`,
                {
                  headers: {
                    Authorization: `Bearer ${openaiApiKey}`,
                    "Content-Type": "application/json",
                    "OpenAI-Beta": "assistants=v2",
                  },
                },
              );
              console.log("Run status:", runStatusResponse.data);
              if (runStatusResponse.data.status === "completed") {
                runComplete = true;
              } else {
                await new Promise((resolve) => setTimeout(resolve, 1000));
              }
            }

            // Fetch the messages added to the thread by the assistant
            const completedRunResponse = await axios.get(
              `https://api.openai.com/v1/threads/${threadId}/messages`,
              {
                headers: {
                  Authorization: `Bearer ${openaiApiKey}`,
                  "Content-Type": "application/json",
                  "OpenAI-Beta": "assistants=v2",
                },
              },
            );

            console.log(
              "Completed run response:",
              JSON.stringify(completedRunResponse.data, null, 2),
            );

            const messages = completedRunResponse.data.data;
            if (messages && messages.length > 0) {
              const assistantMessage = messages.find(
                (msg) => msg.role === "assistant",
              );
              if (
                assistantMessage &&
                assistantMessage.content &&
                assistantMessage.content[0].text
              ) {
                const responseText = assistantMessage.content[0].text.value;
                console.log(`Assistant message: ${responseText}`);

                // Save the question and response to the database
                addMessage(userId, userMessage, responseText);

                // Send the response as a DM to the user
                message.author.send(responseText);
              } else {
                console.log("No assistant messages found in the thread.");
                message.author.send(
                  "I'm sorry, I couldn't generate a response.",
                );
              }
            } else {
              console.log("No messages found in the assistant response.");
              message.author.send("I'm sorry, I couldn't generate a response.");
            }
          });
        }
      });
    } catch (error) {
      console.error(
        "Error communicating with OpenAI:",
        error.response ? error.response.data : error.message,
      );
      message.author.send(
        "Sorry, there was an error communicating with the AI assistant.",
      );
    }
  }
});

client.login(discordBotToken);
