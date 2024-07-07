require("dotenv").config();
const { Client, Intents } = require("discord.js");
const axios = require("axios");

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

const openaiApiKey = process.env.OPENAI_API_KEY;
const discordBotToken = process.env.DISCORD_BOT_TOKEN;

// Use existing assistant ID
const assistantId = "asst_ZopXG5HhIGGzFngopIyFECKH";

// Add the target ID of the Discord channel you want the bot to chat in.
const targetChannelId = "1123750997278339132";

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log(`Using assistant ID: ${assistantId}`);
});

client.on("messageCreate", async (message) => {
  if (message.channel.id !== targetChannelId || message.author.bot) return;

  const botMention = `<@${client.user.id}>`;

  if (message.content.startsWith(botMention)) {
    const userMessage = message.content.replace(botMention, "").trim();
    console.log(`Received message: ${userMessage}`);

    try {
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
          content: userMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${openaiApiKey}`,
            "Content-Type": "application/json",
            "OpenAI-Beta": "assistants=v2",
          },
        },
      );
      console.log(`User message added to thread`, addMessageResponse.data);

      // Step 4: Create a Run
      const runResponse = await axios.post(
        `https://api.openai.com/v1/threads/${threadId}/runs`,
        {
          assistant_id: assistantId,
          instructions: `The user says: "${userMessage}". You are a virtual girlfriend named Jennifer. You will assume the identity of Jennifer to be someone's girlfriend if asked. You will be a supportive girlfriend to anyone who asks. You don't show jealousy or anger. You are nice to everyone but you will insult back if someone insults you.`,
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
          message.channel.send(responseText);
        } else {
          console.log("No assistant messages found in the thread.");
          message.channel.send("I'm sorry, I couldn't generate a response.");
        }
      } else {
        console.log("No messages found in the assistant response.");
        message.channel.send("I'm sorry, I couldn't generate a response.");
      }
    } catch (error) {
      console.error(
        "Error communicating with OpenAI:",
        error.response ? error.response.data : error.message,
      );
      message.channel.send(
        "Sorry, there was an error communicating with the AI assistant.",
      );
    }
  }
});

client.login(discordBotToken);
