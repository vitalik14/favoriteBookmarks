// class Background {
//     constructor() {
//         this.init();
//     }
//     init() {
//         this.connectPopap();
//     }
//     connectPopap() {
//         chrome.extension.onConnect.addListener((port) => {
//             this.port = port;
//             port.onMessage.addListener((msg) => {
//                 this.answerPopap(msg);
//             });
//         });
//     }
//     sendPopap(data) {
//         try {
//             if (!!this.port) { // if open popap
//                 this.port.postMessage(data);
//             }  
//         } catch(e) {
//             console.log(e);
//         }
//     }
//     answerPopap(msg) {

//             switch(msg.type) {
//                 case 'map': this.sendPopap({type: 'map', data: {
//                         map: this.stage,
//                         gameToken: this.gameToken
//                     }});
//                     break;
//                 case 'move':
//                         this.socket.send({
//                             type: 'message',
//                             query: 'move',
//                             coord: msg.coord
//                         });
//                     break;
//             }
//     }
// }
// var stage = new Background();