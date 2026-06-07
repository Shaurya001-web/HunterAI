from langchain.chat_models import init_chat_model
from dotenv import load_dotenv
import os
current_dir=os.path.dirname(os.path.abspath(__file__))
project_root=os.path.dirname(current_dir)
path_env=os.path.join(project_root,"config",".env")
load_dotenv(path_env)
llm_model=init_chat_model(model="groq:llama-3.3-70b-versatile")
res=llm_model.invoke("hi")
print(res)