/* 第17关情境问答样板：本地规则 + 当前代码/报错/运行结果，不调用云端。 */
(function(root){
  'use strict';
  function extension(){
    let api=root.Coach18_25;
    if(!api&&typeof require==='function'){try{api=require('./coach18_25.js');}catch(e){}}
    if(typeof require==='function'){try{require('./coach26_35.js');}catch(e){}}
    if(typeof require==='function'){try{require('./coach36_40.js');}catch(e){}}
    return root.Coach18_25||api||null;
  }
  function extended(ctx){const level=Number(ctx&&ctx.level);return level>=17&&level<=39&&extension();}
  const RULES=[
    {id:'review_code',phrases:['帮我看看','检查我的代码','看看我的代码','我改好了','改完了','这样对吗']},
    {id:'difference',phrases:['有什么区别','有什么不同','不一样','range','for i','编号循环']},
    {id:'variable_item',phrases:['c 是','c是什么','c是','name 是','name是什么','编号','索引','第几个']},
    {id:'for_in',phrases:['for-in','for in','for c','for name','遍历','点名']},
    {id:'result_analysis',phrases:['运行结果','播报结果','输出结果','只出来','只有一个','只播一个','没有颜色','没有所有颜色','几个颜色','名字顺序','为什么是这个','为什么按这个顺序']},
    {id:'line_explain',phrases:['这一行','这行','这段代码','这段','什么意思','什么作用']},
    {id:'indent',phrases:['缩进','空几格','几个空格','空格']},
    {id:'list',phrases:['列表','方括号','数组']},
    {id:'modify_task',phrases:['改成','换成','增加','多加','四个','4个','自己的','不用改循环']},
    {id:'start_task',phrases:['不知道怎么','不知道先','不会开始','先写什么','第一步','怎么开始','卡住','不会做','不懂怎么写']},
    {id:'print',phrases:['print','打印','播报']},
    {id:'error_fix',phrases:['为什么报错','哪里错','报错','错误','不对','运行不了','不能运行','出问题']}
  ];
  const FOLLOW=/还是不懂|没看懂|再简单|再详细|再解释|继续说|然后呢|换个说法|再提示|再举个例子/;
  function classify(question,ctx){
    ctx=ctx||{};
    if(extended(ctx))return extension().classify(question,ctx);
    const q=String(question||'').toLowerCase().replace(/\s+/g,' ').trim();
    if(FOLLOW.test(q)&&ctx.previousIntent&&ctx.previousIntent!=='clarify')return {intent:ctx.previousIntent,confidence:9,depth:(ctx.hintDepth||0)+1};
    let best={intent:'clarify',confidence:0,depth:ctx.hintDepth||0};
    for(const rule of RULES){
      let score=0;
      for(const phrase of rule.phrases){if(q.includes(phrase.toLowerCase()))score+=Math.max(2,phrase.replace(/\s/g,'').length);}
      // “编号”是在追问变量含义，权重要高于句首顺带出现的 for c。
      if(rule.id==='variable_item'&&/编号|索引|第几个/.test(q)&&score)score+=6;
      // 只有明确说“这一行/这段”时才给当前行加成；问 for-in 本身不能被泛化的“什么意思”抢走。
      if(rule.id==='line_explain'&&ctx.selectedLine&&score&&/这一行|这行|这段代码|这段/.test(q))score+=5;
      if(rule.id==='error_fix'&&ctx.analysis&&ctx.analysis.error&&score)score+=4;
      if(score>best.confidence)best={intent:rule.id,confidence:score,depth:ctx.hintDepth||0};
    }
    return best;
  }
  function lineOf(ctx){
    if(ctx.selectedLine)return {n:ctx.lineNumber||0,text:ctx.selectedLine.trim()};
    const lines=String(ctx.code||'').split('\n');
    let n=ctx.lineNumber||0;
    if(!n||!lines[n-1]||!lines[n-1].trim())n=lines.findIndex(s=>/^\s*for\s+\w+\s+in\s+/.test(s))+1;
    if(n<1)n=lines.findIndex(s=>s.trim())+1;
    return {n,text:n>0?lines[n-1].trim():''};
  }
  function errorAnswer(ctx){
    const analysis=ctx.analysis;
    if(!analysis||!analysis.error)return {intent:'error_fix',text:'我刚检查了你现在编辑器里的代码，没有发现语法错误。接下来可以点「▶运行」，看看名单或颜色是不是按你想的顺序出现。\n\n如果你问的是运行结果，我可以接着帮你分析。',chips:['看看运行结果','解释这一行','帮我看看代码']};
    const e=analysis.error,n=e.line||ctx.lineNumber||1,lines=String(ctx.code||'').split('\n'),line=(lines[n-1]||'').trim();
    const kind=String(e.errKind||'').split(':')[0],word=e.errWord||'';
    let reason='这一行的结构还没有写完整。',action='先对照本关三步拆解，只修改这一行，再运行一次。';
    if(kind==='for体空'){reason='for 后面的事没有缩进，电脑不知道它属于循环。';action='把循环里的 pencolor(c)、print 或 forward 前面都空 4 格；else 不属于这一关，不用添加。';}
    else if(kind==='for写法of'){reason='点名列表要用 in，不是其他语言里的 of。';action='把 for c of colors: 改成 for c in colors:，只改 of 这个小地方。';}
    else if(kind==='for写法'){reason='for 开头这句少了结构的一部分。';action='检查四样：for、拿到的名字、in 列表名、结尾冒号，例如 for c in colors:。';}
    else if(kind==='空盒子'){reason='你用到了「'+word+'」，但它在这之前还没有装进东西。';action='把对应列表或变量的创建句子移到使用它的 for/print 前面。';}
    else if(kind==='文字没引号'){reason='列表里的名字是文字，文字要戴英文引号。';action='把球员名分别写成 "梅西"、"包涵" 这样，再用逗号隔开。';}
    else if(kind==='数字文字混加'){reason='这里把数字和文字用 + 混在了一起。';action='这一关先分别 print 名字或数字，不需要把它们拼在一起。';}
    else if(kind==='print写法'){reason='print 括号里的内容还没有写清楚。';action='播报当前拿到的名字就写 print(name)，变量名外面不要加引号。';}
    return {intent:'error_fix',text:'我看到的是第 '+n+' 行：\n`'+line+'`\n\n问题在这里：'+reason+'\n\n你现在只做一步：'+action,chips:['解释这一行','我改好了，帮我看看','还是不懂']};
  }
  function baseAnswer(question,ctx){
    ctx=ctx||{};
    if(extended(ctx))return extension().answer(question,ctx);
    const route=classify(question,ctx),intent=route.intent,depth=route.depth||0;
    if(intent==='error_fix')return Object.assign(errorAnswer(ctx),{confidence:route.confidence});
    if(intent==='review_code'){
      if(!String(ctx.code||'').trim())return {intent,text:'现在编辑器还是空的。先只写第一步：创建一张列表。写完以后再来让我看，不用一次把整个程序写完。',chips:['第一步怎么写','列表是什么']};
      if(ctx.analysis&&ctx.analysis.error)return Object.assign(errorAnswer(ctx),{intent,confidence:route.confidence});
      const code=String(ctx.code||''),hasList=/=\s*\[[^\]]*\]/.test(code),hasFor=/for\s+\w+\s+in\s+(?!range)/.test(code),hasUse=/pencolor\s*\(|print\s*\(/.test(code);
      if(!hasList)return {intent,text:'代码现在能读通，但还没看到一张列表。第 17 关要先准备 colors 或 names，再让 for-in 逐个拿出来。\n\n先补列表这一行，其他代码暂时不用加。',chips:['列表怎么写','我改好了，帮我看看']};
      if(!hasFor)return {intent,text:'列表已经准备好了，下一步还差 for-in 点名。\n\n格式是：for 拿到的名字 in 列表名:。先只补这一句和它的身体，不需要重写列表。',chips:['for-in 怎么写','缩进怎么做']};
      if(!hasUse)return {intent,text:'列表和 for-in 都有了，但循环身体里还要“拿到就使用”：颜色用 pencolor，名字用 print。\n\n选择一种就好，不必两种都写。',chips:['解释 for 这一行','我改好了，帮我看看']};
      if(ctx.isHomework){
        const list=code.match(/=\s*\[([^\]]*)\]/),items=list?list[1].split(',').map(x=>x.trim()).filter(Boolean):[];
        const colorRoute=/pencolor\s*\(/.test(code),need=colorRoute?4:3;
        if(items.length<need)return {intent,text:'独立作业的结构已经对了，但数量还差一点：'+(colorRoute?'彩色阵容需要至少 4 种颜色。':'球员名单需要 3～5 名球员。')+'\n\n现在只修改列表，补到规定数量；for-in 不用改。',chips:['我改好了，帮我看看','怎样增加一项','还是不懂']};
      }
      return {intent,text:'这次代码能读通：有列表、有 for-in，也在循环里使用了拿到的内容。\n\n接下来点「▶运行」，重点观察两件事：顺序是否和列表一致、每个项目是否都出现一次。运行后我还能帮你分析结果。',chips:['看看运行结果','为什么 c 不是编号','我想增加一项']};
    }
    if(intent==='line_explain'){
      const at=lineOf(ctx),line=at.text;
      let text='先看第 '+at.n+' 行：`'+line+'`。';
      const fm=line.match(/^for\s+(\w+)\s+in\s+(\w+)\s*:?$/);
      if(fm)text+='\n\n'+fm[1]+' 是“这一轮拿到的东西”，'+fm[2]+' 是整张列表。它不是编号；列表叫到谁，'+fm[1]+' 这一轮就是谁。\n\n后面缩进的身体，会对每个拿到的东西各做一次。';
      else if(/=\s*\[/.test(line))text+='\n\n这是在创建列表。方括号装内容，逗号负责分开；后面的 for-in 会按这里写的顺序逐个取出。';
      else if(/^pencolor/.test(line))text+='\n\n这是把当前拿到的颜色交给画笔。它在循环里，所以每拿到一个颜色，就换一次画笔。';
      else if(/^print/.test(line))text+='\n\n这是播报当前内容。变量名不戴引号，才会说出盒子里的东西；戴了引号就只会念出变量名本身。';
      else if(/^forward/.test(line))text+='\n\n这是前进一步。它如果缩进在循环里，就会每一轮都前进；和 for 对齐，就只执行一次。';
      else text+='\n\n你可以继续问“它在这一关有什么用”，我会结合列表点名来解释。';
      return {intent,text,chips:['再简单一点','这和编号有什么不同','看看我的代码']};
    }
    if(intent==='variable_item'){
      const code=String(ctx.code||''),fm=code.match(/for\s+(\w+)\s+in\s+(\w+)/),v=fm?fm[1]:'c',list=fm?fm[2]:'colors';
      let text=v+' 不是编号，也不是 0、1、2。它是 '+list+' 里“这一轮拿到的内容本身”。\n\n比如列表是 ["red","yellow","green"]：第一轮 '+v+' 是 red，第二轮是 yellow，第三轮是 green。';
      if(depth>0)text+='\n\n记忆法：for 像老师点名，'+v+' 像当前站起来的那位同学，不是座位号。';
      return {intent,text,chips:['那 range 有什么不同','解释 for 这一行','再举个例子']};
    }
    if(intent==='for_in'){
      let text='for-in 的意思是：把列表里的内容按顺序一个个拿出来，每拿一个，就做一次缩进里的事。\n\nfor c in colors: 里，colors 是整张列表，c 是本轮拿到的颜色。';
      if(depth===1)text+='\n\n想象老师按名单点名：每叫到一个名字，那位同学就做一次相同动作。名单有三项，循环身体就做三次。';
      if(depth>=2)text+='\n\n只记骨架：\nfor c in colors:\n    使用 c 的一件事\n第二行前面空 4 格。';
      return {intent,text,chips:['c 是编号吗','和 range 有什么区别','我不知道先写什么']};
    }
    if(intent==='difference')return {intent,text:'两种循环都能重复，但拿到的东西不同：\n\nfor i in range(3)：i 依次是编号 0、1、2，需要用 colors[i] 再找颜色。\nfor c in colors：c 直接就是 red、yellow、green，不需要再找。\n\n这一关练的是第二种——直接点名。',chips:['c 是编号吗','for-in 怎么写','解释这一行']};
    if(intent==='list')return {intent,text:'列表是一排有顺序的盒子，用方括号装起来，用逗号分开。文字项目要戴引号，例如球员名字。\n\n这一关要先创建列表，再写 for-in；顺序反过来，电脑就会找不到列表。',chips:['for-in 怎么点名','看看我的列表','第一步怎么写']};
    if(intent==='indent')return {intent,text:'缩进表示“这件事装进上面的循环里”。第 17 关的 pencolor(c)、print(name) 或 forward(50)，只要在循环里，前面就统一空 4 格。\n\nfor 那一行不空格；它的身体空 4 格。',chips:['为什么还是报错','解释 for 这一行','我改好了，帮我看看']};
    if(intent==='print')return {intent,text:'print 负责把内容播出来。for name in names: 里写 print(name)，就会逐个说出列表里的名字。\n\nname 不戴引号，因为它是装着当前名字的盒子。',chips:['为什么只播一个名字','name 是编号吗','看看我的代码']};
    if(intent==='start_task'){
      const code=String(ctx.code||''),hasList=/=\s*\[[^\]]*\]/.test(code),hasFor=/for\s+\w+\s+in\s+(?!range)/.test(code);
      let text;
      if(!code.trim())text=ctx.isHomework?'先只做第一步：决定你要点“球员名字”还是“颜色”，然后只创建一张列表。先不写 for，也不写完整答案。':'先只做第①步：创建 colors 列表。写完列表就先让我看，不用急着写后面的循环。';
      else if(!hasList)text='你已经开始写了，但还没看到列表。先补 colors = [...] 或 names = [...]，列表必须放在 for-in 前面。';
      else if(!hasFor)text='列表已经有了，现在只做第②步：写 for c in colors:（或你的变量名）。写完冒号后回车，再考虑身体。';
      else text='列表和 for-in 都有了，现在只检查身体：前面空 4 格，并在里面使用拿到的 c 或 name。';
      if(depth>0)text+='\n\n现在不要改其他地方，只完成我上面说的一步。完成后点“我改好了，帮我看看”。';
      return {intent,text,chips:['我改好了，帮我看看','列表怎么写','for-in 怎么写']};
    }
    if(intent==='result_analysis'){
      const prints=ctx.run&&ctx.run.prints||[],colors=ctx.run&&ctx.run.colors||[];
      if(prints.length)return {intent,text:'你这次运行播报了 '+prints.length+' 句，顺序是：\n'+prints.map((x,i)=>(i+1)+'. '+x).join('\n')+'\n\nfor-in 会按列表从前到后的顺序取内容。如果顺序或数量不是你想的，先检查列表本身，再检查 print 是否缩进在循环里。',chips:['为什么按这个顺序','我想增加一项','解释 for 这一行']};
      if(colors.length)return {intent,text:'这次轨迹里出现了 '+new Set(colors).size+' 种颜色。for-in 每拿到一个列表项目，就执行一次 pencolor。\n\n如果颜色比列表项目少，检查 pencolor(c) 是否缩进在循环里，以及 c 是否就是 for 后面那个名字。',chips:['为什么没有所有颜色','解释 pencolor 这一行','看看我的代码']};
      return {intent,text:'我还没有看到可分析的播报或彩色轨迹。先点一次「▶运行」，运行完再问“看看运行结果”，我就能按你的实际结果讲。',chips:['运行后没有颜色','帮我看看代码','for-in 怎么写']};
    }
    if(intent==='modify_task')return {intent,text:'要增加一名球员或一种颜色，通常只需要修改列表：在方括号里多加一项，别忘了逗号；文字还要戴引号。\n\nfor-in 那一行不用改，它会自动多执行一轮。先只加一项，再运行观察多了什么。',chips:['我改好了，帮我看看','为什么不用改循环','看看运行结果']};
    return {intent:'clarify',text:'我想回答得更准一点。你现在卡在哪一种情况？选一个就行；也可以把光标放在不懂的代码行，再问“这一行什么意思”。',chips:['for-in 是什么意思','我的代码报错了','我不知道先写什么'],confidence:route.confidence};
  }
  function reportSummary(d){
    const base={error_fix:'修复报错',line_explain:'解释代码行',for_in:'for-in概念',variable_item:'当前项含义',difference:'循环对比',list:'列表',indent:'缩进',print:'播报',start_task:'任务拆解',review_code:'代码审查',result_analysis:'结果分析',modify_task:'修改作品',clarify:'待明确问题'};
    const ext=extension(),names=Object.assign(base,ext?ext.INTENT_NAMES:{});
    const rows=(d.askDetails||[]).slice(-6).map(x=>x.q+'［'+(names[x.intent]||x.intent)+(x.error?'；'+x.error:'')+(x.helpful===false?'；当时仍未懂':x.helpful===true?'；已解决':'')+'］');
    const unsure=(d.askDetails||[]).filter(x=>x.helpful===false).length;
    return '    情境问答明细：'+rows.join('、')+'\n    追问反馈：'+unsure+'次“仍未懂”（后续可优先复习这些对应知识点）';
  }
  function answer(question,ctx){
    ctx=ctx||{};const result=baseAnswer(question,ctx),q=String(question||'');
    if(extended(ctx)||!FOLLOW.test(q)||ctx.previousIntent!==result.intent)return result;
    let tip='';const line=String(ctx.selectedLine||'').trim();
    if(result.intent==='review_code'){
      const code=String(ctx.code||''),hasList=/=\s*\[[^\]]*\]/.test(code),hasFor=/for\s+\w+\s+in\s+(?!range)/.test(code),hasUse=/pencolor\s*\(|print\s*\(/.test(code);
      tip=!code.trim()?'先把整关放一边，只创建一张列表；写完列表就停，再做下一步。':!hasList?'现在只补一张列表，不检查其他代码。':!hasFor?'列表已经有了，现在只补 for-in 点名，其他暂时不加。':!hasUse?'现在只在循环身体里使用一次拿到的内容，例如 print(name)。':'先点一次「▶运行」，只核对列表中的一项是否出现。';
    }else if(result.intent==='error_fix')tip='先只修改报错指出的那一行，其他代码暂时不动；改完后再让我重新检查。';
    else if(result.intent==='line_explain')tip='先只读这一句口令'+(line?'：“'+line+'”':'')+'，不用同时理解整段。只找它负责的一个动作。';
    else if(result.intent==='result_analysis')tip='先只核对列表中的一项有没有按顺序出现；这一项对了，再检查下一项。';
    else if(result.intent==='modify_task')tip='先只往列表里增加一项，for-in 不改。运行确认多出一项后，再做别的修改。';
    else if(result.intent==='difference')tip='只看拿到的东西：range 给编号，for-in 直接给列表内容。先记住这一个区别。';
    else if(result.intent==='list')tip='先只写一项列表，例如 names = ["包涵"]。确认方括号、引号都正确，再增加第二项。';
    else if(result.intent==='indent')tip='只看两行：for 顶格，属于它的下一行空 4 格。先把这两行对齐关系看明白。';
    else if(result.intent==='print')tip='只比较 print(name) 和 print("name")：前者取盒子内容，后者念固定字母。';
    else if(result.depth>=2)tip='先暂停记新知识。把光标放在最不懂的一行，问“这一行什么意思”，我们只解决这一行。';
    if(tip)result.text+='\n\n'+tip;return result;
  }
  const api={classify,answer,reportSummary,RULES};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.Coach17=api;
  if(typeof document==='undefined')return;

  const sessions={};
  function session(level){
    const n=level===undefined?curLevel:level;
    return sessions[n]||(sessions[n]={history:[],lastIntent:null,hintDepth:0,lastDetail:null,lastChips:null});
  }
  function capture(){
    const level=curLevel,ed=document.getElementById('editor'),code=ed.value,lines=code.split('\n'),pos=ed.selectionStart||0;
    const lineNumber=code.slice(0,pos).split('\n').length,selectedLine=ed.value.slice(ed.selectionStart,ed.selectionEnd).trim()||lines[lineNumber-1]||'';
    let analysis=null;
    if(code.trim()){
      const nativePrompt=root.prompt;
      try{root.prompt=()=> '示例回答';analysis=compile(code);}
      catch(e){analysis={error:{line:lineNumber,errKind:'读取代码',errWord:''}};}
      finally{root.prompt=nativePrompt;}
    }
    const s=session(level);
    const currentRun=typeof lastRun!=='undefined'&&lastRun&&lastRun.code===code&&lastRun.level===level&&lastRun.phase===phase;
    return {level,code,lineNumber,selectedLine,analysis,isHomework,phase,run:currentRun?{prints:printsArr.slice(),colors:trailColors.slice(),inputs:inputsArr.slice(),turns:trail.length>2?turns(trail):0}:{prints:[],colors:[],inputs:[],turns:0},previousIntent:s.lastIntent,hintDepth:s.hintDepth};
  }
  function record(q,result,ctx){
    const d=LV(ctx.level);d.coachAsk=d.coachAsk||[];d.coachAsk.push(q);d.askCount=(d.askCount||0)+1;
    const detail={q,intent:result.intent,confidence:result.confidence||0,phase:ctx.phase,error:ctx.analysis&&ctx.analysis.error?(ctx.analysis.error.errKind||'语法错误'):null,at:Date.now(),helpful:null};
    d.askDetails=(d.askDetails||[]).concat(detail).slice(-100);session(ctx.level).lastDetail=detail;persistTrack();
  }
  function feedback(){
    const old=document.getElementById('coach17-feedback');if(old)old.remove();
    const log=document.getElementById('ask-log'),row=document.createElement('div');row.id='coach17-feedback';row.className='ask-feedback';
    const yes=document.createElement('button'),no=document.createElement('button');yes.textContent='👍 有帮助';no.textContent='🙋 还是没懂';
    function mark(value){const detail=session().lastDetail;if(detail){detail.helpful=value;persistTrack();}yes.disabled=no.disabled=true;}
    yes.onclick=()=>mark(true);no.onclick=()=>{mark(false);submitCoach17('还是没懂，请换个说法');};
    row.appendChild(yes);row.appendChild(no);log.appendChild(row);log.scrollTop=log.scrollHeight;
  }
  function chips(list){
    const wrap=document.getElementById('ask-chips');wrap.innerHTML='';session().lastChips=list;
    (list||[]).forEach(q=>{const b=document.createElement('button');b.className='ask-chip';b.textContent=q;b.onclick=()=>submitCoach17(q);wrap.appendChild(b);});
  }
  function render(){
    const log=document.getElementById('ask-log');log.innerHTML='';
    session().history.forEach(m=>m.who==='me'?askMe(m.text):askBot(m.text));
  }
  function say(who,text){session().history.push({who,text});who==='me'?askMe(text):askBot(text);}
  function openCoach17(){
    const level=curLevel,s=session(level),cfg=level>=17&&level<=39&&extension()?extension().LEVEL_CONFIG[level]:null;
    askLevel=level;document.querySelector('#ask-head .s').textContent='第 '+(level+1)+' 关情境教练 · 会读当前代码和运行结果，只引导不代做';
    document.getElementById('ask-mask').classList.remove('hidden');
    if(!s.history.length)say('bot','我是第 '+(level+1)+' 关的小航！'+ (cfg?'本关我们练「'+cfg.concept+'」。':'')+'你可以直接用自己的话问。我也能看你现在的代码、报错和运行结果，一次只帮你解决一个小问题。');
    render();chips(s.lastChips||(cfg?cfg.chips:['for-in 是什么意思','c 是编号还是颜色','我不知道先写什么','帮我看看代码']));
    document.getElementById('ask-input').placeholder=cfg?cfg.placeholder:'比如：c 为什么不是编号？';
    setTimeout(()=>document.getElementById('ask-input').focus(),100);
  }
  function submitCoach17(question){
    const q=String(question||'').trim();if(!q)return;
    const input=document.getElementById('ask-input');input.value='';say('me',q);
    const ctx=capture(),s=session(ctx.level),result=answer(q,ctx);
    s.lastIntent=result.intent;s.hintDepth=result.intent===ctx.previousIntent?(ctx.hintDepth||0)+(FOLLOW.test(q)?1:0):0;
    say('bot',result.text);record(q,result,ctx);chips(result.chips);feedback();
  }
  root.openCoach17=openCoach17;
  root.submitCoach17=submitCoach17;
  root.captureCoach17Context=capture;
})(typeof window!=='undefined'?window:globalThis);
