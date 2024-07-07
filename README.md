# Discord_AI_Chatbot_ChatGPT4o
This is a simple bot integration for using assitance with the new ChatGPT Beta API

# Steps to deploy
1. Create your ChatGPT account and set up billing. This is required as the program will use the API from ChatGPT to send and process messages in Discord

2. Set up your Assistant in the OpenAPI playground: https://platform.openai.com/playground/assistants?
   Copy the assistant ID. You will need this later for environmental variables. Starts with asst_
![image](https://github.com/Pcmode/Discord_AI_Chatbot_ChatGPT4o/assets/25157472/25b5bef1-de00-41ce-8eee-d111dba3c9f7)

4. Create the bot on the Discord Devs website: https://discord.com/developers/

![image](https://github.com/Pcmode/Discord_AI_Chatbot_ChatGPT4o/assets/25157472/e5583b92-ed1d-4525-9861-044def9ab25b)


5. OAth2 redirects: https://discord.com/oauth2/authorize?scope=bot&permissions=8&client_id=Your Client ID from above. Looks like: 1259524064616990099

![image](https://github.com/Pcmode/Discord_AI_Chatbot_ChatGPT4o/assets/25157472/a47737c7-fe01-41cb-b471-0638e4fe4666)


6. Under Bot in the Discord Devs website, click reset on the Token button and write down your Token. This is required for the environment variables on https://replit.com/

![image](https://github.com/Pcmode/Discord_AI_Chatbot_ChatGPT4o/assets/25157472/694f8ff5-c1ff-4200-8cc9-6363ae22a8f8)


7. Setup an account on https://replit.com/ and import the project from: https://github.com/Pcmode/Discord_AI_Chatbot_ChatGPT4o
   After importing change the text under Commands > Run command to be: node start

![image](https://github.com/Pcmode/Discord_AI_Chatbot_ChatGPT4o/assets/25157472/96cc831e-c0f3-4e67-8527-54a1353c8f69)


9. Edit lines 13 and 15 with your assitantID and targetChallelID. You can get the channel ID by turning on Developer mode for Discord, right-click the channel ID and copy.
   Example: // Use existing assistant ID
   const assistantId = "your_assistant_id";
   const targetChannelId = "your_discord_channel_id";

10. Add your environmental variables under Tools > secrets in the Replit website interface.
   There should be two variables here to add. Copy and paste the keys saved from above for both the Bot token and Open API Key.
   DISCORD_BOT_TOKEN
   OPENAI_API_KEY

![image](https://github.com/Pcmode/Discord_AI_Chatbot_ChatGPT4o/assets/25157472/572d36d8-7ecf-457d-95ec-f714ce6008b7)


12. After making the edits click the run button to start your project.

13. Bot permissions can be tailored to your liking under the Bot Permissions at https://discord.com/developers/applications/your_bot_id/bot
    Once you have the permissions, copy the URL generated below the window. It should look like: https://discord.com/oauth2/authorize?client_id=DISCORD_BOT_ID&permissions=67035853167936&integration_type=0&scope=bot

![image](https://github.com/Pcmode/Discord_AI_Chatbot_ChatGPT4o/assets/25157472/b1ec1edc-e06c-4219-a74b-66435d198ce8)
![image](https://github.com/Pcmode/Discord_AI_Chatbot_ChatGPT4o/assets/25157472/e2607c22-7414-4333-8971-46a42936eb5e)

##Link to install Discord Bot onto your server
![image](https://github.com/Pcmode/Discord_AI_Chatbot_ChatGPT4o/assets/25157472/ed8b3d2a-b415-46b6-92cb-04cb1f4d8299)


How ChatGPT Assistants: https://platform.openai.com/docs/assistants/how-it-works
 
