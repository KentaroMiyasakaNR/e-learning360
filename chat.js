export { chat };

const API_KEY = '';
const API_URL = 'https://api.openai.com/v1/chat/completions';
const conversationHistory = [];

async function chat(prompt) {
  try {
    conversationHistory.push({ role: 'user', content: prompt });
    console.log(conversationHistory)
    const requestBody = {
      model: 'gpt-3.5-turbo',
      messages: conversationHistory,
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (response.ok) {
      const messageContent = data.choices[0].message.content;
      conversationHistory.push({ role: 'assistant', content: messageContent });
      //console.log(conversationHistory)
      return messageContent;
    } else {
      throw new Error(`API error: ${data.error.message}`);
    }
  } catch (error) {
    console.error('Error during API call:', error.message);
  }
}

async function recordAudio() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);
  let audioChunks = [];

  mediaRecorder.ondataavailable = function(event) {
    audioChunks.push(event.data);
  };

  mediaRecorder.start();

  return new Promise((resolve) => {
    mediaRecorder.onstop = async function() {
      const audioBlob = new Blob(audioChunks);
      const audioBuffer = await blobToArrayBuffer(audioBlob);

      // mp3ファイルを作成
      const mp3File = new File([audioBuffer], 'konnichiwa_02.mp3', { type: 'audio/mpeg' });
      const formData = new FormData();
      formData.append('file', mp3File);
      formData.append('model', 'whisper-1');
      formData.append('language', 'ja'); // 言語を日本語に設定

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: formData
      });

      const data = await response.json();
      if (response.ok) {
        const text = data.text;
        console.log('Transcribed text:', text);
        resolve(text);
      } else {
        console.error('Transcription error:', data.error);
        resolve('');
      }
    };

    setTimeout(() => {
      mediaRecorder.stop();
      stream.getTracks().forEach(track => track.stop());
    }, 3000); // 3秒間録音する
  });
}

async function blobToArrayBuffer(blob) {
  const fileReader = new FileReader();
  return new Promise((resolve, reject) => {
    fileReader.onloadend = () => {
      resolve(fileReader.result);
    };
    fileReader.onerror = reject;
    fileReader.readAsArrayBuffer(blob);
  });
}

document.getElementById('record-button').addEventListener('click', async () => {
  const text = await recordAudio();
  console.log('Transcribed text:', text);
  //sendMessage(text); // ここでチャットボットにテキストを送信する
});