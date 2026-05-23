from flask import Flask, request, jsonify
import pyautogui
import time

app = Flask(__name__)

@app.route('/voice', methods=['POST', 'OPTIONS'])
def trigger_voice():
    # 处理 CORS 预检
    if request.method == 'OPTIONS':
        response = jsonify({'success': True})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response

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

        response = jsonify({'success': True})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
    except Exception as e:
        response = jsonify({'success': False, 'error': str(e)})
        response.status_code = 500
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8787)
