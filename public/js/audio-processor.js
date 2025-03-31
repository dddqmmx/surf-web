class AudioProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (input && input[0]) {
            const inputData = input[0];
            this.port.postMessage(inputData.slice()); // 发送音频数据到主线程
        }
        return true; // 保持处理器活动
    }
}
registerProcessor('audio-processor', AudioProcessor);
