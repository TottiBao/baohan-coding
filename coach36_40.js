/* 第36～40关配置：复用共享情境引擎，读取当前代码、报错与真实运行结果。 */
(function(root){
  'use strict';
  const base=root.Coach18_25||(typeof require==='function'?require('./coach18_25.js'):null);
  if(!base)throw new Error('请先加载 coach18_25.js');
  function step(id,label,test,next,review){return {id,label,test,next,review:review||next};}
  function hint(re,text){return {re,text};}
  const LEVEL_CONFIG={
    35:{
      title:'训练达标统计',concept:'数字列表＋累加＋分支',placeholder:'比如：total 和 passed 有什么不同？',
      chips:['total 和 passed 有什么不同？','为什么 passed 只在达标时加1？','最终统计为什么放循环外？','帮我看看代码'],
      rules:[
        {id:'two_counters',phrases:['total 和 passed','两个盒子','两种统计','总分和达标','有什么不同']},
        {id:'accumulate',phrases:['total','累加','总分','加成绩']},
        {id:'counter',phrases:['passed','达标时','达标数','数次数','几个达标','加1','加 1']},
        {id:'loop_scope',phrases:['最终统计','循环外','循环后','对齐','只播一次','中间结果']},
        {id:'number_list',phrases:['scores','数字列表','成绩列表','引号']}
      ],
      required:[
        step('list','成绩列表',/=\s*\[[^\]]*\d[^\]]*\]/,'先写 scores = [35,60,80]，先只准备三项数字成绩。','先准备数字列表，成绩直接写数字，不戴引号。'),
        step('total','总分盒子',/\btotal\s*=\s*0\s*$/m,'再写 total = 0，准备累计所有成绩。','还缺从 0 开始的总分盒子 total。'),
        step('passed','达标数盒子',/\bpassed\s*=\s*0\s*$/m,'再写 passed = 0，表示还没有统计到达标项。','还缺从 0 开始的达标数盒子 passed。'),
        step('for_in','逐项读取成绩',/for\s+\w+\s+in\s+(?!range)/,'写 for s in scores:，每轮取出一个成绩 s。','还缺 for-in 逐项读取成绩，s 是本轮成绩。'),
        step('accumulate','每轮累计总分',/\btotal\s*=\s*total\s*\+\s*\w+/,'循环里写 total = total + s，每轮都累计。','总分需要每轮累加并保存回 total。'),
        step('if_else','达标二选一',c=>/\bif\s+\w+\s*>=\s*\d+/.test(c)&&/^\s*else\s*:/m.test(c),'写 if s >= 60: 和 else:，分别处理达标与继续训练。','还缺 if/else 判断本轮成绩是否达标。'),
        step('increment','达标才计数',/\bpassed\s*=\s*passed\s*\+\s*1/,'只在达标分支写 passed = passed + 1。','passed 只能在达标分支增加，未达标不能加。'),
        step('final','循环后两项统计',c=>/^print\s*\(\s*total\s*\)\s*$/m.test(c)&&/^print\s*\(\s*passed\s*\)\s*$/m.test(c),'循环结束后分别 print(total) 和 print(passed)，两句与 for 对齐。','最后还缺循环外的总分和达标数播报。')
      ],
      responses:{
        two_counters:['total 负责把每项成绩加起来，所以每轮执行 total=total+s；passed 负责数有几项达标，所以只有条件成立才 passed=passed+1。','像一本记分册有两栏：一栏把分数不断加上去，另一栏每看到一个达标成绩就画一笔。两栏更新时机不同。','只记：total 每项都加成绩；passed 只在达标时加 1。'],
        accumulate:['total=total+s 会取出原来的总分，加上本轮成绩，再存回 total。35、60、80 会依次累计为 35、95、175。','它和计数不同：加进去的是本轮 s 的数值，不是固定加 1。'],
        counter:['passed 统计的是“达标项数”，不是总分。所以只有 if s>=60 成立时才 passed=passed+1；else 只播报继续训练。','三项成绩 35、60、80 中，35 不加，60 和 80 各加一次，最后 passed=2。','把 passed=passed+1 放进 if 身体；如果放到 if 外面，三项都会计数。'],
        loop_scope:['最终 print(total) 和 print(passed) 要与 for 对齐，等所有成绩处理完各播一次。缩进在循环里则会播出每轮中间结果。','循环里负责逐项处理，循环外负责看最终报告。先分清“每轮做”和“最后做一次”。'],
        number_list:['scores 里直接写数字，例如 [35,60,80]，不要给成绩戴引号。for s in scores 每轮取出的 s 就是本轮数字。','数字用于比较和累加；如果变成带引号文字，就不能按本关方式进行数学统计。']
      },
      lineHints:[hint(/\btotal\s*=\s*total\s*\+\s*\w+/,'这一行把本轮成绩加进旧总分并保存回 total，每轮都会执行。'),hint(/\bpassed\s*=\s*passed\s*\+\s*1/,'这一行只在达标分支执行，用于记录达标项数，而不是累加成绩。'),hint(/for\s+\w+\s+in\s+/,'这一轮从成绩列表取出一个数字，s 是本轮成绩本身。'),hint(/^print\s*\(\s*(?:total|passed)\s*\)/,'这是循环后的最终统计，与 for 对齐，所以只播报一次。')],
      chipMap:{two_counters:['为什么 passed 只在达标时加1？','total 每轮怎么变化？','还是不懂'],accumulate:['total 和 passed 有什么不同？','解释这一行'],counter:['35、60、80 会数出几个达标？','我改好了，帮我看看'],loop_scope:['为什么出现中间结果？','看看运行结果'],number_list:['数字列表要加引号吗？','total 和 passed 有什么不同？']},
      result:'先核对每项成绩都有达标或训练反馈，再看最后总分是否为成绩之和、达标数是否只统计达到条件的项目。若中间统计反复出现，检查最终 print 缩进。',
      modify:'想换成自己的训练报告，只改 scores 的数字与项数，统计结构不变。还可以调整达标阈值，但要同时确认 if 条件与播报含义一致。'
    },
    36:{
      title:'函数巡回战术',concept:'带参函数＋列表巡回',placeholder:'比如：列表里的 li 怎么送进函数？',
      chips:['列表里的 li 怎么送进函数？','为什么不写三次 tupo？','函数里的 if 每轮怎么判断？','帮我看看代码'],
      rules:[
        {id:'list_parameter',phrases:['列表里的 li','送进函数','tupo(li)','列表和函数','怎么送']},
        {id:'parameter',phrases:['参数','旋钮','li','力度']},
        {id:'reuse',phrases:['不写三次','复制','重复','同一个工具','复用']},
        {id:'if_else',phrases:['if','else','每轮怎么判断','50','结果不同']},
        {id:'for_in',phrases:['for-in','for in','列表','三轮','巡回']},
        {id:'def_call',phrases:['def','定义','调用','函数','工具']}
      ],
      required:[
        step('def','带参突破工具',/def\s+tupo\s*\(\s*li\s*\)/,'先写 def tupo(li):，li 是每轮送来的力度。','先定义带参数 li 的 tupo 工具。'),
        step('if_else','工具内力度判断',c=>/\bif\s+li\s*>=\s*\d+/.test(c)&&/^\s*else\s*:/m.test(c),'函数里写 if li >= 50: 和 else:，分别播报两种突破方式。','还缺函数内部的 if/else 力度判断。'),
        step('forward','参数控制移动',/forward\s*\(\s*li\s*\)/,'分支后写 forward(li)，让它仍缩进在 def 里。','还要用 forward(li) 让本轮力度控制距离。'),
        step('for_in','三项力度列表',/for\s+li\s+in\s*\[[^\]]*\d[^\]]*\]/,'写 for li in [30,50,80]:，每轮取出一个数字力度。','还缺数字列表配 for-in，让三轮力度自动送入。'),
        step('call','当前项作为参数',/^\s*tupo\s*\(\s*li\s*\)\s*$/m,'循环里写 tupo(li)，把本轮列表项送进工具。','循环里要调用 tupo(li)，不是分别写死三个数字。')
      ],
      responses:{
        list_parameter:['for li in [30,50,80] 每轮把一个数字装进 li；tupo(li) 再把当前 li 交给函数参数。于是函数依次收到 30、50、80。','像传送带每次送来一个力度，tupo(li) 是接货口。本轮送来几，函数里的 if 和 forward 就用几。','只看流向：列表当前项 → 循环变量 li → tupo(li) → 函数参数 li。'],
        parameter:['定义时 li 是参数名；循环调用 tupo(li) 时，把本轮数字填进去。函数每轮都会读取刚收到的力度。','列表中的 30、50、80 不需要分别写三次调用，循环变量会逐个代送。'],
        reuse:['函数已经写好了完整的判断和动作，for-in 只是用不同力度反复调用它。写三次 tupo(30)、tupo(50)、tupo(80) 虽然能动，却没有利用列表自动巡回。','把规则留在函数，把变化的数据留在列表。新增一种力度只改列表，函数和循环都不用复制。'],
        if_else:['每次 tupo(li) 都会重新读取本轮 li。30<50 走 else，50 和 80 达到条件走 if；同一个函数因此产生不同播报。','if/else 在函数身体里，每调用一次就判断一次。列表负责换参数，函数负责按参数选择分支。'],
        for_in:['这里的 li 直接是列表中的数字，不是编号。三项列表让循环身体执行三次，每次 tupo(li) 使用当前项。','三轮依次是 li=30、li=50、li=80；循环里的调用每轮执行一次。'],
        def_call:['def tupo(li): 是制作工具；tupo(li) 是使用工具，并把本轮变量作为数字参数送进去。定义先写，巡回调用后写。','函数只定义一次，调用可以放进循环自动重复。']
      },
      lineHints:[hint(/for\s+li\s+in\s*\[/,'这一行逐轮取出数字力度，li 是当前数字本身，不是列表编号。'),hint(/^\s*tupo\s*\(\s*li\s*\)/,'这一行把本轮 li 送进突破工具，函数会按这个数字判断并移动。'),hint(/^def\s+tupo/,'这一行定义带力度参数的工具，真正执行要等后面的调用。'),hint(/forward\s*\(\s*li\s*\)/,'这里使用函数刚收到的本轮力度控制距离。')],
      chipMap:{list_parameter:['函数里的 if 每轮怎么判断？','为什么不写三次 tupo？','还是不懂'],parameter:['列表里的 li 怎么送进函数？','解释这一行'],reuse:['增加一种力度要改哪里？','我想改成自己的战术'],if_else:['为什么 30 和 50 结果不同？','列表里的 li 怎么送进函数？'],for_in:['li 是编号吗？','看看运行结果'],def_call:['定义和调用有什么不同？','我改好了，帮我看看']},
      result:'三轮应各有一句对应力度的播报和三段不同距离的轨迹。若只执行一次，检查调用是否缩进在 for 里；若距离相同，检查函数是否使用 forward(li)。',
      modify:'想换战术力度，只改 for-in 后面的数字列表。增加 shemen(li) 时，先独立验证新工具，再在同一个循环里调用，保持每轮先突破再射门。'
    },
    37:{
      title:'幸运巡回挑战',concept:'while＋两种随机＋统计',placeholder:'比如：wins 和 rounds 为什么不一样？',
      chips:['wins 和 rounds 为什么不一样？','choice 和 randint 怎么合作？','为什么夺冠只播一次？','帮我看看代码'],
      rules:[
        {id:'two_counters',phrases:['wins 和 rounds','两个统计','为什么不一样','胜场和轮数','实际轮数']},
        {id:'random_roles',phrases:['choice 和 randint','两种随机','怎么合作','对手和骰子']},
        {id:'choice',phrases:['choice','对手','抽签']},
        {id:'randint',phrases:['randint','骰子','点数','每轮结果不同','结果不同']},
        {id:'counter',phrases:['wins','rounds','计数','加1','加 1']},
        {id:'loop_scope',phrases:['夺冠只播一次','循环外','循环后','最终','总轮数']},
        {id:'infinite_loop',phrases:['死循环','停不下来','一直跑']},
        {id:'event_loop',phrases:['while','三胜','目标','继续挑战','失败了为什么继续']}
      ],
      required:[
        step('wins','胜场盒子',/\bwins\s*=\s*0\s*$/m,'先写 wins = 0，目标是赢满 3 场。','先准备从 0 开始的胜场盒子 wins。'),
        step('rounds','轮数盒子',/\brounds\s*=\s*0\s*$/m,'再写 rounds = 0，记录实际挑战了多少轮。','还缺从 0 开始的轮数盒子 rounds。'),
        step('while','三胜才停',/\bwhile\s+wins\s*</,'写 while wins < 3:，没达到三胜就继续。','还缺 while wins < 3 的持续挑战。'),
        step('choice','随机对手',/=\s*random\s*\.\s*choice\s*\(/,'每轮用 opponent = random.choice([...]) 保存抽到的对手。','每轮先用 choice 从对手列表抽一项并保存。'),
        step('randint','本轮点数',/=\s*random\s*\.\s*randint\s*\(/,'同一轮再保存 dice = random.randint(1,6)。','还要用 randint 保存本轮点数。'),
        step('round_count','每轮记轮数',/\brounds\s*=\s*rounds\s*\+\s*1/,'在分支外写 rounds = rounds + 1，每轮都执行。','无论胜负都要记录一轮，rounds 更新应放在 if/else 外。'),
        step('if_else','胜负二选一',c=>/\bif\s+dice\s*>=\s*\d+/.test(c)&&/^\s*else\s*:/m.test(c),'用 if dice >= 4: 和 else: 处理胜负两种反馈。','还缺根据本轮 dice 判断胜负的 if/else。'),
        step('win_count','胜利才加胜场',/\bwins\s*=\s*wins\s*\+\s*1/,'只在胜利分支写 wins = wins + 1。','只有胜利才增加 wins，否则循环目标不能正确达到。'),
        step('final','循环后最终播报',c=>/^print\s*\(/m.test(c)&&/\bforward\s*\(/.test(c),'每轮 forward；循环结束后播报夺冠和 rounds，最终 print 与 while 对齐。','补齐每轮移动，以及循环后的夺冠和总轮数播报。')
      ],
      responses:{
        two_counters:['wins 只记录胜利，失败时不加；rounds 每轮都加，所以实际挑战轮数通常是 wins 加失败次数，可能大于 3。','例如三轮结果“胜、负、胜”：wins=2，rounds=3。继续挑战到第三次胜利时，两个数字才分别停止在最终结果。','只记：wins 数成功，rounds 数所有轮次；它们不是同一个盒子。'],
        random_roles:['choice 从对手列表随机抽一个队名并保存到 opponent；randint 产生本轮数字点数并保存到 dice。一个决定“和谁比”，一个决定“本轮结果”。','两种随机先各自保存，后面的 print 使用同一个 opponent，if 使用同一个 dice，本轮播报和判断才一致。','choice 管列表抽签，randint 管随机数字；它们分工后由 if/else 处理结果。'],
        choice:['random.choice([...]) 每轮从候选对手里抽一个。opponent 保存队名，播报时用 opponent + "：获胜！" 就能带上本轮对手。','对手可能连续相同，这是正常随机；候选列表决定可能出现哪些队。'],
        randint:['random.randint(1,6) 每轮产生 1～6 的点数，if dice>=4 决定本轮是否获胜。','dice 只负责本轮数字，不会自动增加 wins 或 rounds；统计要自己写。'],
        counter:['rounds=rounds+1 放在 if/else 外、while 内，每轮都执行；wins=wins+1 放在胜利分支里，只有成功才执行。','如果把 rounds 放进胜利分支，它就会漏掉失败轮；如果 wins 也每轮加，就变成“挑战三轮”而不是“赢满三场”。'],
        loop_scope:['夺冠和总轮数 print 与 while 对齐，达到三胜退出循环后只执行一次。每轮胜负播报和 forward 则在循环里。','还没赢满时不能提前夺冠，所以最终播报不能缩进在 while 内。'],
        infinite_loop:['停不下来时先检查 wins=wins+1 是否位于能成立的胜利分支。forward、print 和 rounds 增加都不会让 while 的 wins 条件接近结束。','while 只看 wins；只有胜利分支保存新胜场，达到 3 才会停止。'],
        event_loop:['while wins<3 让挑战继续到三胜。每轮重新抽对手、掷点数、更新轮数并判断胜负，失败不会结束比赛。','所需轮数不固定，因为 random 可能连续胜利或失败。']
      },
      lineHints:[hint(/random\s*\.\s*choice/,'这一行随机抽取本轮对手并保存，后续播报使用同一个 opponent。'),hint(/random\s*\.\s*randint/,'这一行产生本轮点数并保存，if 会用它判断胜负。'),hint(/\brounds\s*=\s*rounds\s*\+\s*1/,'这一行位于每轮公共流程，胜负都会让实际轮数加 1。'),hint(/\bwins\s*=\s*wins\s*\+\s*1/,'这一行只在胜利分支更新胜场，是 while 最终停止的关键。'),hint(/^print\s*\(/,'顶格最终播报在 while 结束后执行，不会每轮重复。')],
      chipMap:{two_counters:['为什么 rounds 可能大于3？','choice 和 randint 怎么合作？','还是不懂'],random_roles:['为什么对手会重复？','为什么每轮结果不同？'],choice:['对手怎样放进播报？','解释这一行'],randint:['点数怎样决定胜负？','我改好了，帮我看看'],counter:['失败时哪个盒子会加1？','一直停不下来怎么办？'],loop_scope:['为什么夺冠只播一次？','看看运行结果'],infinite_loop:['wins+1 写在哪里？','我改好了，帮我看看'],event_loop:['失败了为什么继续？','wins 和 rounds 为什么不一样？']},
      result:'胜负播报总数等于 rounds，胜利播报数等于 wins；最后夺冠与总轮数各出现一次。轮数大于 3 很正常，因为失败也占一轮。',
      modify:'想改成四胜巡回，只把 while 目标改成 4，并可更换对手列表和胜利阈值。保留 rounds 每轮加、wins 胜利才加以及循环后最终播报。'
    },
    38:{
      title:'冠军直播间',concept:'互动直播综合项目',placeholder:'比如：直播间先做哪个模块？',
      chips:['直播间先做哪个模块？','数字战报怎么统计？','random 和 if/else 怎么合作？','帮我看看代码'],
      rules:[
        {id:'start_project',phrases:['直播间先做','先做哪个','直播流程','主线','开场','模块']},
        {id:'minimal',phrases:['最小版本','先完成','简化','太多']},
        {id:'accumulate',phrases:['数字战报','统计','累加','总分','数据']},
        {id:'random_if',phrases:['random 和 if','随机和判断','怎么合作','赛果']},
        {id:'input',phrases:['input','互动','观众','回答']},
        {id:'param_def',phrases:['def','参数','函数','工具','定义和调用']},
        {id:'for_in',phrases:['for-in','for in','列表','战报']}
      ],
      required:[
        step('input','观众入场互动',/\b\w+\s*=\s*input\s*\(/,'先用 input 问观众一个问题，保存回答并用 print 播一句欢迎词。','先补一个能保存并使用回答的 input 开场。'),
        step('list','数字战报列表',/=\s*\[[^\]]*\d[^\]]*\]/,'准备一张数字列表，记录几场比分或训练数据。','直播间还缺数字战报列表。'),
        step('for_in','逐项处理战报',/for\s+\w+\s+in\s+(?!range)/,'用 for-in 逐项读取数字战报，每轮取出当前数据。','还缺 for-in 逐项处理战报。'),
        step('counter','战报统计',/\b\w+\s*=\s*\w+\s*\+\s*(?:\d+|\w+)/,'加入 total 或 score 统计，先初始化，再在合适位置更新。','还缺变量统计，让战报或比分能被记住。'),
        step('def','带参数动作工具',/def\s+\w+\s*\(\s*\w+\s*\)/,'做一个带参数 def，用参数控制 forward，并在后面调用。','还缺带参数的动作工具，定义后要调用。'),
        step('random','随机比赛事件',/\brandom\s*\./,'加入一次 random，保存本轮赛果或随机事件。','还缺 random 事件，结果先保存再使用。'),
        step('if_else','赛果二选一',c=>/\bif\b/.test(c)&&/^\s*else\s*:/m.test(c),'根据随机或比分写 if/else，分别播报两种赛果。','还缺 if/else 处理两种比赛结果。'),
        step('prints','至少六句播报',c=>(c.match(/\bprint\s*\(/g)||[]).length>=6,'核心流程能运行后，把开场、战报、赛果和收尾播报补到至少 6 句。','作品还需要至少 6 句 print 播报。'),
        step('colors','至少两种颜色',c=>(c.match(/\bpencolor\s*\(/g)||[]).length>=2,'用两种 pencolor 区分不同直播环节。','还缺至少两种轨迹颜色。'),
        step('turns','至少四次转弯',c=>(c.match(/\b(?:left|right)\s*\(/g)||[]).length>=4,'最后补至少 4 次转弯，完成直播战术路线。','还缺至少 4 次转弯。')
      ],
      responses:{
        start_project:['先做最小主线：观众 input 入场 → 数字战报 for-in 统计 → 带参工具动作 → random 赛果与 if/else → 统计和庆祝。每段完成就运行。','不要先写所有特效。先让开场能互动、战报能计算、赛果能判断，这三件事工作后再补完整画面。','现在只选“开场、战报、比赛”中的一段完成，不要同时铺开所有模块。'],
        minimal:['最小版本要能回答三个问题：谁在看直播？战报算出了什么？本轮比赛结果是什么？对应 input、列表统计、random＋if/else。','先短而完整，再逐块加工具、颜色和转弯；能运行并讲得清楚比代码长更重要。'],
        accumulate:['数字列表保存每场数据，total 从 0 开始；for g in goals 每轮取一个数字，total=total+g 累加并存回。循环后 print(total) 播最终战报。','如果还要数达标或进球次数，另用一个计数盒子只在对应条件成立时加 1，不要把总分和次数混在一起。'],
        random_if:['random 先产生并保存本轮事件，例如 dice=random.randint(1,6)；if/else 再读取同一个 dice 选择两种赛果。','随机负责“发生了什么”，判断负责“这代表什么结果”。不要在 if 和播报里分别重新随机。'],
        input:['input 是直播开场互动。回答保存到 fan 后，要用 print 或拼接真正使用一次，让观众进入节目流程。','先问一个与直播有关的问题，再把回答用于欢迎词，不要只写裸 input。'],
        param_def:['带参 def 负责可复用动作，参数控制距离或力度。先定义并调用一次，确认能用，再接入比赛或庆祝。','工具只负责一个清楚动作；直播主线通过调用决定它何时出现。'],
        for_in:['for-in 可逐项读取数字战报，也可播报阵容。本关优先让数字列表与统计合作，形成真正的数据环节。','当前项是每场数字本身，累加时直接使用，不需要列表编号。']
      },
      lineHints:[hint(/=\s*input\s*\(/,'这是直播互动入口，回答保存后要在欢迎词或后续节目中使用。'),hint(/\w+\s*=\s*\w+\s*\+\s*(?:\d+|\w+)/,'这一行更新直播统计，把新结果保存回盒子。'),hint(/^def\s+|^\s*def\s+/,'这是直播动作工具，参数让同一动作能适应不同力度。'),hint(/random\s*\./,'这里产生并保存一次比赛事件，后面交给 if/else 判断。'),hint(/^if\s+|^\s+if\s+/,'这是赛果二选一规则，两种结果分别处理。')],
      chipMap:{start_project:['数字战报怎么统计？','random 和 if/else 怎么合作？','还是不懂'],minimal:['直播间先做哪个模块？','帮我看看代码'],accumulate:['统计变量为什么先装0？','解释这一行'],random_if:['为什么每轮赛果不同？','看看运行结果'],input:['回答怎样放进欢迎词？','我改好了，帮我看看'],param_def:['定义和调用有什么不同？','直播间先做哪个模块？'],for_in:['数字战报怎么统计？','看看运行结果']},
      result:'按直播流程验收：观众回答被使用、数字战报有统计、工具被调用、随机结果进入 if/else。再看至少 6 句播报、2 种颜色和 4 次转弯，不要只检查“没报错”。',
      modify:'扩展直播时一次只加一个环节：新增数据只改列表，新增解说只改播报，新增动作优先复用带参工具。每次修改后运行并保留可用版本。'
    },
    39:{
      title:'传奇冠军杯',concept:'自由创作终极项目',placeholder:'比如：终极项目怎样开始？',
      chips:['终极项目怎样开始？','为什么要做两个带参工具？','怎样设计自己的比赛规则？','帮我看看代码'],
      rules:[
        {id:'minimal',phrases:['终极项目','怎样开始','先做什么','最小版本','开始']},
        {id:'multiple_functions',phrases:['两个带参工具','两个工具','为什么要做','多个函数','两种工具']},
        {id:'own_rules',phrases:['自己的比赛规则','设计规则','赛制','剧情','自由设计','创意']},
        {id:'input',phrases:['input','互动','观众','回答']},
        {id:'for_in',phrases:['for-in','for in','列表','阵容']},
        {id:'random_if',phrases:['random','随机','if','else','赛果']},
        {id:'counter',phrases:['统计','计数','累加','变量','才加1','加1','加 1']}
      ],
      required:[
        step('input','一次真实互动',/\b\w+\s*=\s*input\s*\(/,'先设计一句冠军杯开场提问，保存并实际使用回答。','先补一次能保存并使用回答的 input 互动。'),
        step('for_in','列表与逐项处理',/for\s+\w+\s+in\s+(?!range)/,'准备自己的阵容或数据列表，用 for-in 逐项处理。','还缺列表配 for-in，内容可以是阵容或比赛数据。'),
        step('defs','两个带参数工具',c=>(c.match(/def\s+\w+\s*\(\s*\w+\s*\)/g)||[]).length>=2,'分别设计两个带参数 def，例如突破与射门，各自只负责一种动作。','还缺两个带参数 def，每个工具负责一种清楚动作。'),
        step('calls','两个工具真正调用',c=>{const defs=new Set(Array.from(c.matchAll(/def\s+(\w+)\s*\(\s*\w+\s*\)/g),m=>m[1]));const calls=new Set(Array.from(c.matchAll(/^\s*(\w+)\s*\(\s*(?:\d+|\w+)\s*\)\s*$/gm),m=>m[1]).filter(name=>defs.has(name)));return defs.size>=2&&calls.size>=2;},'定义后按自己的赛制调用两个工具，参数可以填数字或当前变量。','两个工具都要真正调用，只有定义不会进入比赛。'),
        step('random','一次随机事件',/\brandom\s*\./,'加入一次 random 并保存结果，让冠军杯有悬念。','还缺 random 随机事件，结果要保存再使用。'),
        step('if_else','自己的二选一规则',c=>/\bif\b/.test(c)&&/^\s*else\s*:/m.test(c),'用 if/else 实现自己的赛果规则，两条分支都有意义。','还缺 if/else 二选一规则。'),
        step('counter','比赛统计',/\b\w+\s*=\s*\w+\s*\+\s*(?:\d+|\w+)/,'设置统计起点，并在相应事件发生时更新比分或数据。','还缺变量统计，让作品记住比赛过程。'),
        step('prints','至少六句播报',c=>(c.match(/\bprint\s*\(/g)||[]).length>=6,'把开场、阵容、赛果和收尾播报补到至少 6 句。','作品还需要至少 6 句 print 播报。'),
        step('colors','至少两种颜色',c=>(c.match(/\bpencolor\s*\(/g)||[]).length>=2,'用至少两种 pencolor 区分自己的比赛环节。','还缺至少两种轨迹颜色。'),
        step('turns','至少四次转弯',c=>(c.match(/\b(?:left|right)\s*\(/g)||[]).length>=4,'完成至少 4 次转弯的创作路线。','还缺至少 4 次转弯。')
      ],
      responses:{
        minimal:['先写自己的最小赛制：一句互动开场、一张阵容或数据列表、两个简单动作工具、一次随机赛果、一个统计结果。能运行后再加剧情。','终极项目不是一次写最多代码，而是先让规则完整跑通。每次只加一个模块，并保留上一个能运行的版本。','先用四句中文写下“开场—挑战—结果—庆祝”，然后只实现第一句。'],
        multiple_functions:['两个带参工具让不同动作各自有清楚规则，例如 tupo(li) 管突破、shemen(li) 管射门。参数让同一工具适应不同力度，调用顺序由你的赛制决定。','像教练有两张战术卡：每张独立写好，再按比赛需要组合。改一个工具不会影响另一个。','先让两个工具各自只做一个动作并分别调用成功，再接进随机比赛。'],
        own_rules:['先决定三个规则：怎样算成功、成功后哪个统计会变化、达到什么结果后怎样庆祝。再用 random＋if/else 和变量实现，不必堆所有旧语法。','你的规则可以和别人不同，但程序里要一致：播报说的结果、if 判断的条件、统计更新的时机要对应。','先只设计一条规则，例如“点数达到5就进球并加1分”，跑通后再增加自己的剧情。'],
        input:['input 回答要保存并真正用于作品，例如欢迎观众或生成专属队名。提问最好与冠军杯剧情有关。','互动不是凑语法：回答至少影响一句播报或一个环节。'],
        for_in:['列表可装球员、对手或比赛数据，for-in 逐项取出。先决定列表在赛制里的作用，再写循环身体。','阵容列表适合点名，数字列表适合统计；当前项都是内容本身。'],
        random_if:['random 产生并保存赛果，if/else 根据同一结果处理两种情况。成功分支可更新统计，另一分支给鼓励或不同剧情。','先保存一次随机结果，再判断和播报，避免同轮重新随机造成前后不一致。'],
        counter:['统计盒子先初始化，再按规则更新。进球数只在进球分支加，总轮数每轮加，总分则累加当前数字。','统计要服务于你的赛制，并在结尾播报，让观众看得到比赛过程。']
      },
      lineHints:[hint(/=\s*input\s*\(/,'这是冠军杯互动入口，回答保存后应在自己的剧情中使用。'),hint(/^def\s+|^\s*def\s+/,'这是一个专属动作工具，参数让调用能传入不同力度。'),hint(/random\s*\./,'这里产生随机赛果并保存，后续判断使用同一次结果。'),hint(/^if\s+|^\s+if\s+/,'这里实现你的二选一比赛规则，分支内容要与条件含义一致。'),hint(/\w+\s*=\s*\w+\s*\+\s*(?:\d+|\w+)/,'这一行按赛制更新统计，让作品记住比赛进度。')],
      chipMap:{minimal:['怎样设计自己的比赛规则？','为什么要做两个带参工具？','还是不懂'],multiple_functions:['两个工具怎样组合？','终极项目怎样开始？','还是不懂'],own_rules:['random 和 if/else 怎么配合？','统计变量怎么更新？'],input:['回答怎样用于剧情？','我改好了，帮我看看'],for_in:['列表能装什么？','看看运行结果'],random_if:['为什么每次赛果不同？','怎样设计自己的比赛规则？'],counter:['什么时候才加1？','我改好了，帮我看看']},
      result:'先按你的赛制验收，不只数语法：互动是否使用、两个工具是否都执行、随机与判断是否一致、统计是否符合规则。再看至少 6 句播报、2 种颜色和 4 次转弯，最后给家人演示讲解。',
      modify:'扩展时优先发展自己的规则与剧情：调整赛制、工具或统计含义，一次只改一个模块并运行。不要为追求长度堆叠没有作用的代码。'
    }
  };
  // 独立作业的要求不同于模仿阶段：四项成绩、双工具巡回、四胜巡回。
  LEVEL_CONFIG[35].homeworkRequired=LEVEL_CONFIG[35].required.map((s,i)=>i===0?step('list','四项成绩列表',/=\s*\[\s*\d+(?:\s*,\s*\d+){3}\s*\]/,'先准备恰好四项数字成绩，再开始统计。','独立作业需要先准备四项数字成绩。'):s);
  LEVEL_CONFIG[36].homeworkRequired=[
    step('two_defs','两个带参工具',c=>/def\s+tupo\s*\(\s*li\s*\)/.test(c)&&/def\s+shemen\s*\(\s*li\s*\)/.test(c),'分别定义 tupo(li) 和 shemen(li)，两个工具都接收力度。','独立作业需要突破和射门两个带参工具。'),
    step('two_if_else','两个工具各自判断',c=>(c.match(/\bif\s+li\s*>=\s*\d+/g)||[]).length>=2&&(c.match(/^\s*else\s*:/gm)||[]).length>=2,'两个函数内部都写 if/else，分别处理不同力度。','两个工具内部都要有自己的 if/else 力度判断。'),
    step('two_forward','两个工具各自移动',c=>(c.match(/forward\s*\(\s*li\s*\)/g)||[]).length>=2,'两个函数身体都使用 forward(li)，让参数控制移动。','两个工具都要用 forward(li) 执行本轮力度。'),
    LEVEL_CONFIG[36].required[3],
    step('two_calls','每轮依次调用两个工具',c=>/^\s*tupo\s*\(\s*li\s*\)/m.test(c)&&/^\s*shemen\s*\(\s*li\s*\)/m.test(c),'循环里依次写 tupo(li) 和 shemen(li)，每轮先突破再射门。','循环里要把本轮 li 分别送给两个工具。')
  ];
  LEVEL_CONFIG[37].homeworkRequired=LEVEL_CONFIG[37].required.map(s=>s.id==='while'?step('while','四胜才停',/\bwhile\s+wins\s*<\s*4/,'独立作业写 while wins < 4:，赢满四场才停。','独立作业目标是四胜，请检查 while 后面的目标数字。'):s);
  Object.assign(base.LEVEL_CONFIG,LEVEL_CONFIG);
  Object.assign(base.INTENT_NAMES,{two_counters:'双统计变量',list_parameter:'列表参数传递',reuse:'函数复用',random_roles:'两种随机分工',start_project:'项目主线拆解',random_if:'随机与判断',own_rules:'自主规则设计'});
  const api={LEVEL_CONFIG};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.Coach36_40=api;
})(typeof window!=='undefined'?window:globalThis);
