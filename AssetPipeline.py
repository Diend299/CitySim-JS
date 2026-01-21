import gradio as gr
import requests
import base64
import io
import os
from rembg import remove
from PIL import Image
import time

# === 配置 ===
SD_URL = "http://127.0.0.1:7860"
OUTPUT_DIR = "./assets/"

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

# === 后端逻辑函数 ===

def get_sd_models():
    """从 SD API 获取所有可用模型列表"""
    try:
        response = requests.get(f"{SD_URL}/sdapi/v1/sd-models")
        if response.status_code == 200:
            models = [m['title'] for m in response.json()]
            return models
        return ["连接失败，请检查SD是否启动"]
    except:
        return ["连接失败，请检查SD是否启动"]

def refresh_models():
    """刷新模型列表（给按钮用）"""
    return gr.update(choices=get_sd_models())

def switch_model(model_name):
    """调用 API 切换 SD 模型"""
    if not model_name:
        return "请先选择模型"
    
    payload = {"sd_model_checkpoint": model_name}
    try:
        requests.post(f"{SD_URL}/sdapi/v1/options", json=payload)
        return f"✅ 模型已切换为: {model_name.split('.')[0]}"
    except Exception as e:
        return f"❌ 切换失败: {e}"

def generate_preview(prompt, steps, cfg):
    """第一步：生成高清预览图"""
    full_prompt = f"{prompt}, pixel art, simple, top-down view, white background, chibi, game sprite"
    negative_prompt = "blurry, realistic, photo, shadow, messy, text, watermark"
    
    payload = {
        "prompt": full_prompt,
        "negative_prompt": negative_prompt,
        "steps": steps,
        "cfg_scale": cfg,
        "width": 512,
        "height": 512,
        "sampler_name": "Euler a"
    }
    
    try:
        response = requests.post(f"{SD_URL}/sdapi/v1/txt2img", json=payload)
        r = response.json()
        image_data = base64.b64decode(r['images'][0])
        img = Image.open(io.BytesIO(image_data))
        return img, "✨ 预览生成完毕，请决定是否采纳"
    except Exception as e:
        return None, f"❌ 生成失败: {e}"

def process_and_save(image, filename):
    """第二步：采纳 -> 抠图 -> 像素化 -> 保存"""
    if image is None:
        return None, "⚠️ 请先生成图片！"
    
    if not filename:
        filename = f"asset_{int(time.time())}"
    
    try:
        # 1. 抠图
        img_no_bg = remove(image)
        
        # 2. 像素化 (缩放到 32x32)
        # 如果你想保留点细节，可以先缩放到 64 再缩回 32，或者直接 32
        target_size = (32, 32)
        img_pixelated = img_no_bg.resize(target_size, Image.Resampling.NEAREST)
        
        # 3. 保存
        save_path = os.path.join(OUTPUT_DIR, f"{filename}.png")
        img_pixelated.save(save_path)
        
        return img_pixelated, f"🎉 成功！已保存至: {save_path}"
    except Exception as e:
        return None, f"❌ 处理失败: {e}"

# === 前端界面构建 (Gradio) ===

with gr.Blocks(title="像素游戏资产工厂", theme=gr.themes.Soft()) as app:
    gr.Markdown("# 🏭 像素游戏资产自动化工厂 (AIGC Pipeline)")
    
    with gr.Row():
        # 左侧：控制面板
        with gr.Column(scale=1):
            gr.Markdown("### 1. 模型设置")
            with gr.Row():
                model_dropdown = gr.Dropdown(label="选择大模型 (Checkpoint)", choices=get_sd_models(), value=None)
                refresh_btn = gr.Button("🔄", size="sm")
            
            # 绑定刷新事件
            refresh_btn.click(fn=refresh_models, outputs=model_dropdown)
            # 绑定切换事件
            model_dropdown.change(fn=switch_model, inputs=model_dropdown, outputs=None)
            
            gr.Markdown("### 2. 生成设置")
            prompt_input = gr.Textbox(label="提示词 (Prompt)", placeholder="例如: cute knight, blue armor", lines=2)
            filename_input = gr.Textbox(label="资产保存文件名 (不带后缀)", placeholder="例如: player_idle")
            
            with gr.Accordion("高级参数", open=False):
                step_slider = gr.Slider(10, 50, value=20, label="步数 (Steps)")
                cfg_slider = gr.Slider(1, 20, value=7, label="相关性 (CFG Scale)")
            
            generate_btn = gr.Button("🎨 生成预览", variant="primary")
            
        # 右侧：结果展示
        with gr.Column(scale=2):
            gr.Markdown("### 3. 预览与采纳")
            
            with gr.Row():
                # 预览区
                with gr.Column():
                    preview_image = gr.Image(label="原始生成结果 (512x512)", type="pil", interactive=False)
                
                # 结果区
                with gr.Column():
                    final_image = gr.Image(label="最终资产 (32x32)", type="pil", image_mode="RGBA")
            
            status_text = gr.Textbox(label="系统状态", value="就绪")
            
            # 采纳按钮
            accept_btn = gr.Button("✅ 满意，执行抠图并保存！", variant="stop")

    # === 事件绑定 ===
    generate_btn.click(
        fn=generate_preview,
        inputs=[prompt_input, step_slider, cfg_slider],
        outputs=[preview_image, status_text]
    )
    
    accept_btn.click(
        fn=process_and_save,
        inputs=[preview_image, filename_input],
        outputs=[final_image, status_text]
    )

# 启动应用
if __name__ == "__main__":
    app.launch()