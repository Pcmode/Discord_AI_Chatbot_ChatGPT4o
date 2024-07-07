# Discord_AI_Chatbot_ChatGPT4o
This is a simple bot integration for using assitance with the new ChatGPT Beta API

# Steps to deploy
1. Create your ChatGPT account and set up billing. This is required as the program will use the API from ChatGPT to send and process messages in Discord

2. Set up your Assistant in the OpenAPI playground: https://platform.openai.com/playground/assistants?

3. Create the bot on the Discord Devs website: https://discord.com/developers/

4. OAth2 redirects: https://discord.com/oauth2/authorize?scope=bot&permissions=8&client_id=Your Client ID from above. Looks like: 1259524064616990099

5. Under Bot in the Discord Devs website, click reset on the Token button and write down your Token. This is required for the environment variables on https://replit.com/

6. Setup an account on https://replit.com/ and import the project from: https://github.com/Pcmode/Discord_AI_Chatbot_ChatGPT4o
   After importing change the text under Commands > Run command to be: node start

7. Edit lines 13 and 15 with your assitantID and targetChallelID. You can get the channel ID by turning on Developer mode for Discord, right-click the channel ID and copy.
   Example: // Use existing assistant ID
   const assistantId = "your_assistant_id";
   const targetChannelId = "your_discord_channel_id";

8. Add your environmental variables under Tools > secrets in the Replit website interface.
   There should be two variables here to add. Copy and paste the keys saved from above for both the Bot token and Open API Key.
   DISCORD_BOT_TOKEN
   OPENAI_API_KEY
9. After making the edits click the run button to start your project.

10. Bot permissions can be tailored to your liking under the Bot Permissions at https://discord.com/developers/applications/your_bot_id/bot
    Once you have the permissions, copy the URL generated below the window. It should look like: https://discord.com/oauth2/authorize?client_id=DISCORD_BOT_ID&permissions=67035853167936&integration_type=0&scope=bot


How ChatGPT Assistants: https://platform.openai.com/docs/assistants/how-it-works
 
