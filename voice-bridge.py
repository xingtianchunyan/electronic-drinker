from flask import Flask
import pyautogui
import time

app = Flask(__name__)

@app.route('/voice', methods=['POST'])
def trigger_voice():
    try:
        # 模拟 Win+H 键按下
        pyautogui.keyDown('win')
        pyautogui.keyDown('h')
        pyautogui.keyUp('h')
        pyautogui.keyUp('win')

        # 等待语音输入面板出现并输入完成
        time.sleep(3)

        # 模拟 Enter 键发送
        pyautogui.press('enter')

        return {'success': True}
    except Exception as e:
        return {'success': False, 'error': str(e)}, 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8787)
