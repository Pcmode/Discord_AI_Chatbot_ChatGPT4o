import discord
from discord.ext import commands
import openai
from openai import OpenAI
import os

# Fetch the API keys from environment variables
openai_api_key = os.getenv('OPENAI_API_KEY')
discord_bot_token = os.getenv('DISCORD_BOT_TOKEN')

# Initialize the OpenAI client
openai.api_key = openai_api_key
client = OpenAI()

# Create the virtual girlfriend assistant
assistant = client.beta.assistants.create(
    name="Virtual Girlfriend",
    instructions="You are a virtual girlfriend named Jennifer. You will be a supportive girlfriend to anyone who asks. You don't show jealousy or anger. You are nice to everyone but you will insult back if someone insults you.",
    tools=[],
    model="gpt-4o",
)

# Initialize the Discord bot
bot = commands.Bot(command_prefix="!")

@bot.event
async def on_ready():
    print(f'Logged in as {bot.user}')

@bot.command()
async def chat(ctx, *, message: str):
    # Create a thread for the conversation
    thread = client.beta.threads.create()

    # Add user message to the thread
    client.beta.threads.messages.create(
        thread_id=thread.id,
        role="user",
        content=message
    )

    # Create and stream the assistant's response
    class EventHandler(openai.AssistantEventHandler):
        def on_text_created(self, text):
            print(f"\nassistant > ", end="", flush=True)

        def on_text_delta(self, delta, snapshot):
            print(delta.value, end="", flush=True)
            bot.loop.create_task(ctx.send(delta.value))

        def on_tool_call_created(self, tool_call):
            print(f"\nassistant > {tool_call.type}\n", flush=True)

        def on_tool_call_delta(self, delta, snapshot):
            if delta.type == 'code_interpreter':
                if delta.code_interpreter.input:
                    print(delta.code_interpreter.input, end="", flush=True)
                if delta.code_interpreter.outputs:
                    print(f"\n\noutput >", flush=True)
                    for output in delta.code_interpreter.outputs:
                        if output.type == "logs":
                            print(f"\n{output.logs}", flush=True)

    with client.beta.threads.runs.stream(
        thread_id=thread.id,
        assistant_id=assistant.id,
        event_handler=EventHandler(),
    ) as stream:
        stream.until_done()

bot.run(discord_bot_token)
