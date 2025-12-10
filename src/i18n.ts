import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      "title": "Kuroko's Teleport",
      "subtitle": "Peer-to-Peer file transfer base on super power (WebRTC)",
      "send": "SEND",
      "recv": "RECV",
      "select-files": "Click or drag&drop the files here to upload.",
      "warning": "Illegal content is prohibited, including but not limited to piracy, gambling, and fraud.",
      "more-apps": "More APPs:",
      "waiting": "Establishing a WebRTC channel, please wait.",
      "my-home": "My Home Page",
      "source": "Source Code",
      "placeholder": "Please input peer ID of the other side",
      "copy-id": "Copy ID",
      "copy-url": "Copy URL",
      "connect": "Connect",
      "refresh": "Refresh",
      "download": "Download",
    }
  },
  zh: {
    translation: {
      "title": "黑子的传送",
      "subtitle": "基于超能力（WebRTC）的点对点文件传输",
      "send": "发送",
      "recv": "接收",
      "select-files": "点击或拖拽文件到此处上传。",
      "warning": "禁止传输违法内容，包括但不限于盗版、赌博、诈骗等。",
      "more-apps": "更多应用：",
      "waiting": "正在建立 WebRTC 信道，请稍等。",
      "my-home": "我的主页",
      "source": "本站源码",
      "placeholder": "请输入对端 ID",
      "copy-id": "复制 ID",
      "copy-url": "复制 URL",
      "start": "开始",
      "connect": "连接",
      "refresh": "刷新",
      "download": "下载",
    }
  }
};

i18n.use(initReactI18next).init({
    resources,
    lng: "zh",
});

export default i18n;