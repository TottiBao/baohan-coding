/* CoCube 双入口公共模块：地图、预检、BH1 协议、BLE/Mock 与逐步执行器。
   浏览器：window.CoCube；Node 测试：require('./cocube.js').CoCube */
(function(root, factory){
  const api = factory();
  if(typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CoCube = api.CoCube;
})(typeof self !== 'undefined' ? self : globalThis, function(){
  'use strict';

  const FIELD = Object.freeze({width:300, height:200, margin:5, origin:{x:100,y:150}});
  const UUID = Object.freeze({
    service:'bb37a001-b922-4018-8e74-e14824b3a638',
    rx:'bb37a002-b922-4018-8e74-e14824b3a638',
    tx:'bb37a003-b922-4018-8e74-e14824b3a638'
  });
  const normAngle = a => ((a % 360) + 360) % 360;
  const angleDelta = (a,b) => Math.abs(((a-b+540)%360)-180);
  const round3 = n => Math.round(n*1000)/1000;
  const webToField = p => ({x:round3(FIELD.origin.x+p.x), y:round3(FIELD.origin.y-p.y)});
  const fieldToWeb = p => ({x:round3(p.x-FIELD.origin.x), y:round3(FIELD.origin.y-p.y)});
  const webAngleToCoCube = a => normAngle(a+90);
  const coCubeAngleToWeb = a => normAngle(a-90);

  const LEVELS = {
    0:{
      name:'顺序跑位', startWeb:{x:0,y:0,a:90}, maxMotion:8,
      tasks:{
        imitate:{
          title:'🤖 CoCube 模仿任务：L 形跑位',
          text:'在同一张足球地图上，按顺序完成：前进 100 → 右转 90° → 前进 80。网页路线与实体目标点完全对应。',
          expectedPath:[[0,0],[0,100],[80,100]], finalAngle:0,
          answer:'forward(100)\nright(90)\nforward(80)'
        },
        homework:{
          title:'🤖 CoCube 独立任务：连续两次 L 形跑位',
          text:'不看答案，自己排出连续两次右转的跑位：前进 60 → 右转 90° → 前进 80 → 右转 90° → 前进 60。先模拟预检，再让机器人上场。',
          expectedPath:[[0,0],[0,60],[80,60],[80,0]], finalAngle:270,
          answer:'forward(60)\nright(90)\nforward(80)\nright(90)\nforward(60)'
        }
      }
    },
    1:{
      name:'循环绕场', startWeb:{x:0,y:0,a:90}, maxMotion:8, requiredConcept:'for',
      tasks:{
        imitate:{
          title:'🤖 CoCube 模仿任务：正方形绕场',
          text:'必须用 for i in range(4): 重复「前进 100、右转 90°」，让机器人沿边长 100 的正方形回到起点。',
          expectedPath:[[0,0],[0,100],[100,100],[100,0],[0,0]], finalAngle:90,
          answer:'for i in range(4):\n    forward(100)\n    right(90)'
        },
        homework:{
          title:'🤖 CoCube 独立任务：边长 90 的循环跑位',
          text:'不看答案，用 for 循环让机器人跑边长 90 的正方形并回到起点。不能把四遍动作逐行抄出来。',
          expectedPath:[[0,0],[0,90],[90,90],[90,0],[0,0]], finalAngle:90,
          answer:'for i in range(4):\n    forward(90)\n    right(90)'
        }
      }
    }
  };

  function buildPlan(ops, cfg){
    if(!cfg || !cfg.startWeb) return {ok:false,error:{code:'NO_CONFIG',message:'这一关还没有 CoCube 地图配置。'}};
    const motion = (ops||[]).filter(o=>['forward','left','right'].includes(o.cmd));
    const unsupported = (ops||[]).find(o=>!['forward','left','right'].includes(o.cmd));
    if(unsupported) return {ok:false,error:{code:'UNSUPPORTED',message:'CoCube 目前只接受 forward、left、right，画面颜色和播报不会发给机器人。'}};
    if(!motion.length) return {ok:false,error:{code:'EMPTY',message:'还没有可执行的跑位动作。'}};
    if(motion.length>cfg.maxMotion) return {ok:false,error:{code:'TOO_MANY',message:`本关最多 ${cfg.maxMotion} 个运动动作，请用循环或减少动作。`}};
    let pose={...cfg.startWeb};
    const route=[[pose.x,pose.y]], steps=[];
    for(let i=0;i<motion.length;i++){
      const op=motion[i], val=Number(op.val), from=webToField(pose);
      if(!Number.isFinite(val)) return {ok:false,error:{code:'BAD_NUMBER',message:`第 ${i+1} 个动作的数字无效。`}};
      if(op.cmd==='forward'){
        if(val<0 || val>300) return {ok:false,error:{code:'BAD_DISTANCE',message:'实体跑位只接受 0～300 的前进距离。'}};
        const rad=pose.a*Math.PI/180;
        pose={...pose,x:round3(pose.x+Math.cos(rad)*val),y:round3(pose.y+Math.sin(rad)*val)};
        const target=webToField(pose);
        if(target.x<FIELD.margin || target.x>FIELD.width-FIELD.margin || target.y<FIELD.margin || target.y>FIELD.height-FIELD.margin){
          return {ok:false,error:{code:'OUT_OF_FIELD',message:`第 ${i+1} 个动作会到达 (${target.x}, ${target.y})，超出安全球场范围。请缩短距离或改变方向。`}};
        }
        route.push([pose.x,pose.y]);
        steps.push({seq:steps.length+1,type:'MOVE',op:{...op},from,target,webTarget:{x:pose.x,y:pose.y},angle:webAngleToCoCube(pose.a)});
      }else{
        if(Math.abs(val)>360) return {ok:false,error:{code:'BAD_TURN',message:'单次转弯不能超过 360°。'}};
        pose={...pose,a:normAngle(pose.a+(op.cmd==='left'?val:-val))};
        steps.push({seq:steps.length+1,type:'TURN',op:{...op},from,target:from,webTarget:{x:pose.x,y:pose.y},angle:webAngleToCoCube(pose.a)});
      }
    }
    return {ok:true,plan:{steps,route,final:{...pose},start:{...cfg.startWeb},finalField:webToField(pose)}};
  }

  function validatePlan(plan,cfg,phase,src){
    if(cfg.requiredConcept==='for' && !/\bfor\s+[a-zA-Z_]\w*\s+in\s+range\s*\(/.test(src||'')){
      return {ok:false,code:'FOR_REQUIRED',message:'这一关要练的是 for 循环。请用 for i in range(4): 包住重复动作，不能逐行抄四遍。'};
    }
    const task=cfg.tasks[phase], actual=plan.route, expected=task.expectedPath;
    if(actual.length!==expected.length) return {ok:false,code:'ROUTE_LENGTH',message:`路线应当有 ${expected.length-1} 段前进，现在有 ${actual.length-1} 段。请看地图目标点再调整。`};
    for(let i=0;i<expected.length;i++){
      if(Math.hypot(actual[i][0]-expected[i][0],actual[i][1]-expected[i][1])>0.6){
        return {ok:false,code:'ROUTE_MISMATCH',message:`第 ${i} 个目标点不匹配。模拟路线必须依次经过地图上的标记点。`};
      }
    }
    if(angleDelta(plan.final.a,task.finalAngle)>0.6) return {ok:false,code:'ANGLE_MISMATCH',message:'终点位置对了，但最后朝向还不对，请检查转弯方向和角度。'};
    return {ok:true,task};
  }

  function encodeCommand(cmd){
    if(!cmd || !['MOVE','TURN','STOP'].includes(cmd.type)) throw new Error('未知 CoCube 命令');
    if(cmd.type==='STOP') return 'BH1,STOP';
    if(!Number.isInteger(cmd.seq) || cmd.seq<1 || cmd.seq>9999) throw new Error('无效序号');
    if(cmd.type==='MOVE'){
      if(!Number.isFinite(cmd.x)||!Number.isFinite(cmd.y)) throw new Error('无效目标点');
      return `BH1,MOVE,${cmd.seq},${round3(cmd.x)},${round3(cmd.y)}`;
    }
    if(!Number.isFinite(cmd.angle)) throw new Error('无效角度');
    return `BH1,TURN,${cmd.seq},${round3(normAngle(cmd.angle))}`;
  }
  function commandForStep(step){
    return step.type==='MOVE' ? {type:'MOVE',seq:step.seq,x:step.target.x,y:step.target.y} : {type:'TURN',seq:step.seq,angle:step.angle};
  }
  function outgoingPacket(text){
    const bytes=new TextEncoder().encode(text), len=bytes.length+1;
    const out=new Uint8Array(5+len);
    out.set([0xFB,0x1B,0,len&255,(len>>8)&255],0);
    out.set(bytes,5); out[5+bytes.length]=0xFE;
    return out;
  }
  function parseMessage(text){
    const p=String(text).trim().split(',');
    if(p[0]!=='BH1') return null;
    if(p[1]==='READY' && p.length===2) return {type:'READY'};
    if(p[1]==='STOPPED') return {type:'STOPPED'};
    if(p[1]==='POSE' && p.length===5) return {type:'POSE',x:+p[2],y:+p[3],a:normAngle(+p[4])};
    if(p[1]==='DONE' && p.length===6) return {type:'DONE',seq:+p[2],x:+p[3],y:+p[4],a:normAngle(+p[5])};
    if(p[1]==='ERROR' && p.length>=3) return {type:'ERROR',seq:+p[2]||0,message:p.slice(3).join(',').slice(0,120)||'机器人报告错误'};
    return null;
  }

  class PacketDecoder{
    constructor(onMessage){this.onMessage=onMessage;this.buf=[];}
    feed(bytes){
      for(const b of new Uint8Array(bytes)) this.buf.push(b);
      let madeProgress=true;
      while(madeProgress){
        madeProgress=false;
        let at=-1;
        for(let i=0;i<this.buf.length-1;i++){if(this.buf[i]===0xFB&&this.buf[i+1]===0x1B){at=i;break;}}
        if(at<0){this.buf=this.buf.slice(-1);return;}
        if(at>0){this.buf=this.buf.slice(at);madeProgress=true;}
        if(this.buf.length<5)return;
        const len=this.buf[3]|(this.buf[4]<<8);
        if(len<1||len>2048){this.buf=this.buf.slice(2);madeProgress=true;continue;}
        if(this.buf.length<5+len)return;
        let data=this.buf.slice(5,5+len);this.buf=this.buf.slice(5+len);madeProgress=true;
        if(data[data.length-1]===0xFE)data=data.slice(0,-1);
        let text='';try{text=new TextDecoder().decode(new Uint8Array(data));}catch(e){continue;}
        const msg=parseMessage(text);if(msg&&this.onMessage)this.onMessage(msg);
      }
    }
  }

  class MockTransport{
    constructor(options){this.options=options||{};this.connected=false;this.onMessage=null;this.onDisconnect=null;this.timers=new Set();this.pose=Object.assign({x:100,y:150,a:180},(options&&options.initialPose)||{});}
    later(fn,ms){const id=setTimeout(()=>{this.timers.delete(id);fn();},ms==null?(this.options.latency==null?25:this.options.latency):ms);this.timers.add(id);return id;}
    emit(msg){if(this.onMessage)this.onMessage(msg);}
    async connect(){this.connected=true;this.later(()=>this.emit({type:'READY'}),0);}
    async send(text){
      if(!this.connected)throw new Error('模拟机器人未连接');
      const p=text.split(','),type=p[1],seq=+p[2];
      if(type==='STOP'){
        for(const id of this.timers)clearTimeout(id);this.timers.clear();
        this.later(()=>this.emit({type:'STOPPED'}),0);return;
      }
      if(seq===this.options.dropSeq)return;
      if(seq===this.options.disconnectSeq){this.later(()=>this.disconnect('模拟断连'),5);return;}
      if(type==='MOVE'){this.pose.x=+p[3];this.pose.y=+p[4];}
      if(type==='TURN'){this.pose.a=+p[3];}
      const target=Object.assign({},this.pose,this.options.pose||{});
      this.later(()=>this.emit({type:'DONE',seq,x:target.x,y:target.y,a:target.a}),this.options.latency);
    }
    async disconnect(reason){
      if(!this.connected)return;this.connected=false;
      for(const id of this.timers)clearTimeout(id);this.timers.clear();
      if(this.onDisconnect)this.onDisconnect(reason||'模拟连接已断开');
    }
  }

  class BLETransport{
    constructor(nav){this.nav=nav||navigator;this.device=null;this.rx=null;this.decoder=new PacketDecoder(m=>{if(this.onMessage)this.onMessage(m);});this.onMessage=null;this.onDisconnect=null;this.connected=false;}
    async connect(){
      if(!this.nav.bluetooth)throw new Error('请使用电脑版 Chrome 或 Edge，并通过 localhost 或 HTTPS 打开页面');
      this.device=await this.nav.bluetooth.requestDevice({filters:[{services:[UUID.service]}]});
      this.device.addEventListener('gattserverdisconnected',()=>{this.connected=false;if(this.onDisconnect)this.onDisconnect('CoCube 蓝牙已断开');});
      const server=await this.device.gatt.connect(),service=await server.getPrimaryService(UUID.service);
      this.rx=await service.getCharacteristic(UUID.rx);
      const tx=await service.getCharacteristic(UUID.tx);
      tx.addEventListener('characteristicvaluechanged',e=>this.decoder.feed(new Uint8Array(e.target.value.buffer)));
      await tx.startNotifications();this.connected=true;
    }
    async send(text){
      if(!this.connected||!this.rx)throw new Error('CoCube 未连接');
      const bytes=outgoingPacket(text);
      for(let at=0;at<bytes.length;at+=240){
        const chunk=bytes.slice(at,at+240);
        if(this.rx.writeValueWithoutResponse)await this.rx.writeValueWithoutResponse(chunk);
        else await this.rx.writeValue(chunk);
      }
    }
    async disconnect(){if(this.device&&this.device.gatt.connected)this.device.gatt.disconnect();this.connected=false;}
  }

  class Runner{
    constructor(transport,callbacks,timeouts){
      this.transport=transport;this.cb=callbacks||{};this.timeouts=Object.assign({move:20000,turn:10000,total:120000,ready:6000},timeouts||{});
      this.pending=new Map();this.ready=false;this.running=false;this.runId=0;this.totalTimer=null;
      transport.onMessage=m=>this.handleMessage(m);
      transport.onDisconnect=reason=>this.handleDisconnect(reason);
    }
    notify(type,data){if(this.cb.onProgress)this.cb.onProgress(type,data||{});}
    async waitReady(){
      if(this.ready)return;
      await new Promise((resolve,reject)=>{
        const timer=setTimeout(()=>{this.readyWait=null;reject(new Error('没有收到 BH1,READY。请确认机器人端通用接收程序已启动。'));},this.timeouts.ready);
        this.readyWait=()=>{clearTimeout(timer);this.readyWait=null;resolve();};
      });
    }
    handleMessage(msg){
      if(msg.type==='READY'){this.ready=true;if(this.readyWait)this.readyWait();this.notify('ready',msg);return;}
      if(msg.type==='POSE'||msg.type==='DONE'){
        if(this.cb.onPose)this.cb.onPose(msg);
        if(msg.type==='POSE')return;
      }
      if(msg.type==='DONE'){
        const p=this.pending.get(msg.seq);if(!p)return;
        clearTimeout(p.timer);this.pending.delete(msg.seq);p.resolve(msg);return;
      }
      if(msg.type==='ERROR'){
        const p=this.pending.get(msg.seq);
        if(p){clearTimeout(p.timer);this.pending.delete(msg.seq);p.reject(new Error(msg.message));}
        this.notify('error',msg);return;
      }
      if(msg.type==='STOPPED'){this.notify('stopped',msg);}
    }
    handleDisconnect(reason){
      this.ready=false;const err=new Error(reason||'连接已断开');
      for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(err);}this.pending.clear();
      this.notify('disconnect',{reason:err.message});
    }
    async run(plan){
      if(this.running)throw new Error('机器人正在执行，请先等待或急停');
      if(!this.transport.connected)throw new Error('请先连接机器人');
      await this.waitReady();
      if(!plan||!plan.steps.length)throw new Error('没有可执行的计划');
      this.running=true;const id=++this.runId;this.notify('start',{total:plan.steps.length});
      this.totalTimer=setTimeout(()=>this.failAll(new Error('总执行时间超过安全上限，已停止')),this.timeouts.total);
      try{
        for(const step of plan.steps){
          if(id!==this.runId)throw new Error('执行已取消');
          this.notify('step',{step,total:plan.steps.length});
          const done=await this.sendAndWait(step);
          if(id!==this.runId)throw new Error('执行已取消');
          this.notify('ack',{step,done,total:plan.steps.length});
        }
        this.notify('complete',{total:plan.steps.length});return {ok:true};
      }catch(err){this.notify('error',{message:err.message});throw err;}
      finally{if(this.totalTimer)clearTimeout(this.totalTimer);this.totalTimer=null;this.running=false;}
    }
    sendAndWait(step){
      const cmd=commandForStep(step),text=encodeCommand(cmd);
      return new Promise((resolve,reject)=>{
        const limit=step.type==='MOVE'?this.timeouts.move:this.timeouts.turn;
        const timer=setTimeout(()=>{this.pending.delete(step.seq);this.transport.send('BH1,STOP').catch(()=>{});reject(new Error(`第 ${step.seq} 步等待回执超时，已发送停车命令`));},limit);
        this.pending.set(step.seq,{resolve,reject,timer});
        this.transport.send(text).catch(err=>{clearTimeout(timer);this.pending.delete(step.seq);reject(err);});
      });
    }
    failAll(err){
      for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(err);}this.pending.clear();
      this.transport.send('BH1,STOP').catch(()=>{});
    }
    async stop(){
      ++this.runId;this.failAll(new Error('已急停，本次不会记为完成'));this.running=false;
      if(this.transport.connected)await this.transport.send('BH1,STOP');
    }
  }

  return {CoCube:{FIELD,UUID,LEVELS,normAngle,angleDelta,webToField,fieldToWeb,webAngleToCoCube,coCubeAngleToWeb,buildPlan,validatePlan,encodeCommand,commandForStep,outgoingPacket,parseMessage,PacketDecoder,MockTransport,BLETransport,Runner}};
});
