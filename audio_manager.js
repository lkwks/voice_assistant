export class AudioManager{
    constructor()
    {
        this.play_q = [];
        this.audio = new Audio();
        this.audio.addEventListener("ended", ()=>this.play());
        this.langname = this.get_langname();
    }

    get_langname() {
        const rand_num = Math.floor(Math.random()*10);
        const name_char = 'CEFGHACFAC';
        const lang_code = (rand_num < 5) ? 'US' : ( (rand_num < 8) ? 'GB' : 'AU' );      
        return `en-${lang_code}-Wavenet-${name_char[rand_num]}`;
    }
    
    play()
    {
        if (this.play_q.length > 0 && this.audio.paused)
        {
            this.audio.src = this.play_q.shift();
            this.audio.play();
        }
    }
    
    async push_text(text)
    {
        let tts_result = await this.get_tts(text);
        if (tts_result)
            this.play_q.push(tts_result);
        else {
            tts_result = await this.get_tts(text, true);
            this.play_q.push(tts_result);
        }
        this.play();
    }

    async get_tts(text, eleven_ranout = false) {
        console.log(text);
        let params, response, blob;
    
        if (localStorage.getItem("API_SERVICE_PROVIDER") === "google" || eleven_ranout) {
        var langname = this.langname;
          params = {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ input: { text:text }, voice: {languageCode: langname.substring(0,5), name: langname}, audioConfig: { audioEncoding: 'LINEAR16'}}),
            };
          response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${localStorage.getItem("TTS_API_KEY")}`, params);
          blob = new Blob([Uint8Array.from(atob((await response.json()).audioContent), c => c.charCodeAt(0))], { type: 'audio/mp3' });
        } else {
          params = {
                method: 'POST',
                headers: {'Content-Type': 'application/json',
                          'accept': 'audio/mpeg',
                          'xi-api-key': localStorage.getItem("TTS_API_KEY_ELEVENLABS")
                         },
                body: JSON.stringify({ text:text, model_id: "eleven_monolingual_v1", voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
          };
          response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${localStorage.getItem("VOICE_ID_ELEVENLABS")}`, params);
          if (response.ok)
            blob = new Blob([await response.arrayBuffer()], { type: 'audio/mpeg' });
          else
            return "";
        }
        return URL.createObjectURL(blob);    
    }
}
