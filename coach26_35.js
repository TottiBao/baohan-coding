/* 第26～35关配置：复用第18～25关共享情境引擎。 */
(function(root){
  'use strict';
  const base=root.Coach18_25||(typeof require==='function'?require('./coach18_25.js'):null);
  if(!base)throw new Error('请先加载 coach18_25.js');
  function step(id,label,test,next,review){return {id,label,test,next,review:review||next};}
  function hint(re,text){return {re,text};}
  const LEVEL_CONFIG={
    25:{
      title:'名单记分员',concept:'for-in＋变量＋print',placeholder:'比如：为什么最后的人数只播一次？',
      chips:['怎么一边点名一边记人数？','为什么最后的人数只播一次？','score+1 写在哪里？','帮我看看代码'],
      rules:[
        {id:'loop_scope',phrases:['最后','总人数','循环外','对齐','只播一次','只出来','循环后','循环里会播','1、2、3']},
        {id:'counter',phrases:['score','计数','人数','加1','加 1','记人数']},
        {id:'for_in',phrases:['for-in','for in','名单','name','players','点名']},
        {id:'string_join',phrases:['拼接','上场','解说']},
        {id:'variable',phrases:['变量','盒子']}
      ],
      required:[
        step('list','球员名单',/=\s*\[[^\]]*\]/,'先准备 players = ["梅西","C罗","包涵"]，先不写循环。','先创建球员名单，后面的 for-in 才能逐个点名。'),
        step('counter','人数盒子',/\b\w+\s*=\s*0\s*$/m,'再写 score = 0，表示还没开始数人。','还缺一个从 0 开始的人数盒子，先写 score = 0。'),
        step('for_in','逐个拿出名字',/for\s+\w+\s+in\s+(?!range)/,'名单和计数有了，再写 for name in players:，每轮拿到一个 name。','还缺 for-in 点名，name 是当前球员，不是编号。'),
        step('print','逐个播报',/\bprint\s*\(/,'循环身体空 4 格写 print(name + " 上场！")，每点一人播一次。','循环里要用 print 播报当前名字，可和固定文字拼接。'),
        step('increment','每轮加 1',/\b\w+\s*=\s*\w+\s*\+\s*1/,'同样在循环里写 score = score + 1，每点一人就加 1。','还缺每轮 score = score + 1；它要和循环里的 print 对齐。'),
        step('final','循环后播总人数',/^print\s*\(\s*\w+\s*\)\s*$/m,'最后让 print(score) 顶格和 for 对齐，全部点完才播总人数。','最后还缺循环外的 print(score)，它不能缩进在 for 里。')
      ],
      responses:{
        for_in:['for name in players: 会按名单顺序逐个取出名字。name 是本轮球员本身，每轮循环身体里的 print 和计数都会执行一次。','像教练拿着首发名单点名：叫到谁，name 这一轮就是谁；播报到谁，再把人数加 1。','只记顺序：准备 players 和 score=0 → for 点名 → 循环里 print(name) 和 score+1。'],
        counter:['score 是人数盒子。score = score + 1 取出旧人数、加 1、再存回；它缩进在循环里，所以每点一名球员才加一次。','如果三名球员，score 会依次从 0 变 1、2、3。只写 score + 1 不写 score =，新人数不会保存。','记分口诀：先装 0，每点一人加 1，全部点完再 print(score)。'],
        loop_scope:['循环里的 print(name) 每轮播报当前球员；循环外顶格的 print(score) 等所有人点完后只执行一次，所以总人数只播一次。','缩进决定“每轮做”还是“最后做一次”。print(score) 如果空 4 格，就会每轮播报 1、2、3；顶格才只播最后的 3。','看竖线：for 身体里的两句空 4 格；最后 print(score) 和 for 对齐。'],
        string_join:['print(name + " 上场！") 把当前球员名和固定文字接成一句。name 每轮变化，" 上场！" 保持不变。','name 是盒子不戴引号，固定文字戴引号，+ 负责接起来。'],
        variable:['players 和 score 是两种盒子：players 装整张名单，score 装一个会变化的数字。先准备好，再在循环里使用。']
      },
      lineHints:[hint(/for\s+\w+\s+in\s+/,'这一行逐个取出名单中的球员，name 是当前名字；下面缩进的播报和加 1 每轮都会做。'),hint(/\w+\s*=\s*\w+\s*\+\s*1/,'这一行把旧人数加 1 后存回。它缩进在循环里，所以每点一人执行一次。'),hint(/^print\s*\(\s*\w+\s*\)/,'这是循环后的总人数播报。它和 for 对齐，所以只执行一次。')],
      chipMap:{for_in:['score+1 写在哪里？','name 是编号吗？','还是不懂'],counter:['为什么最后的人数只播一次？','score 为什么先装 0？','我改好了，帮我看看'],loop_scope:['为什么循环里会播出 1、2、3？','解释这一行','看看运行结果'],string_join:['变量名为什么不加引号？','看看运行结果']},
      result:'先核对名字是否逐个出现，再看最后总人数是否等于名单人数。如果每轮都出现中间人数，检查最后的 print(score) 是否误缩进在循环里。',
      modify:'想换成自己的冠军名单，只改 players 里的名字和数量；for-in 与计数结构不用改。新增庆祝转弯时，放在循环结束后，避免每点一人就重复庆祝。'
    },
    26:{
      title:'门将二选一',concept:'if/else＋random',placeholder:'比如：为什么 if 和 else 只走一个？',
      chips:['为什么 if 和 else 只走一个？','else 要和谁对齐？','为什么每轮结果不同？','帮我看看代码'],
      rules:[
        {id:'if_else',phrases:['if','else','二选一','分支','否则','只走一个','扑出']},
        {id:'counter',phrases:['score','记分','加1','加 1','进球数','四轮后','4分']},
        {id:'loop_scope',phrases:['forward','每轮都','缩进','对齐','循环里','只有进球才前进']},
        {id:'random',phrases:['random','随机','骰子','每轮结果']}
      ],
      required:[
        step('counter','比分盒子',/\b\w+\s*=\s*0\s*$/m,'先写 score = 0，表示现在还没有进球。','先准备从 0 开始的比分盒子。'),
        step('for','四轮点球',/for\s+\w+\s+in\s+range\s*\(/,'再写 for i in range(4):，让点球重复 4 轮。','还缺固定 4 轮的 for 循环。'),
        step('random','本轮骰子',/=\s*random\s*\.\s*randint\s*\(/,'循环里写 dice = random.randint(1,6)，每轮保存新点数。','每轮先用 random 产生并保存 dice。'),
        step('if','进球分支',/\bif\s+\w+\s*>=\s*\d+/,'写 if dice >= 4:，4、5、6 走进球分支。','还缺 if 条件判断本轮是否进球。'),
        step('else','扑出分支',/^\s*else\s*:/m,'让 else: 和 if 对齐，另一种情况播报扑出。','还缺 else 处理不满足条件的情况，且必须与 if 对齐。'),
        step('increment','进球才记分',/\b\w+\s*=\s*\w+\s*\+\s*1/,'在 if 身体里写 score = score + 1，else 里不要加分。','只有进球分支才增加 score。'),
        step('feedback','播报与每轮移动',c=>/\bprint\s*\(/.test(c)&&/\bforward\s*\(/,'两个分支分别 print，forward 和 if 对齐放在 for 里，保证每轮都前进。','补齐两种结果的播报，并让 forward 每轮都执行。')
      ],
      responses:{
        if_else:['if 和 else 是二选一：dice >= 4 成立走 if，否则走 else。同一轮不会两句分支播报都执行。','像裁判只吹一种结果：进球就走记分那一路，没进就走扑出那一路。判断后，程序继续执行分支外的 forward。','记结构：if 条件: 和 else: 对齐；两个分支的身体各自再空 4 格。'],
        random:['每轮 random.randint(1,6) 都会重新产生点数并装进 dice，所以 4 轮结果可能不同，也可能出现相同点数。','random 只负责制造本轮悬念，if/else 负责根据同一个 dice 选择结果。不要在一个分支里又重新随机。'],
        counter:['score = score + 1 只放在 if 的进球分支里。扑出的 else 只播报，不改变比分。','如果 else 也加 1，四轮后 score 永远是 4，就失去了判断意义。'],
        loop_scope:['forward 要和 if/else 对齐、但仍缩进在 for 里，这样无论进球还是扑出，每轮都会前进。','如果 forward 缩进在某个分支里，就只会进球或只会扑出时移动；顶格移出 for，则四轮只走一次。']
      },
      lineHints:[hint(/^if\s+|^\s+if\s+/,'这一行读取本轮 dice，条件成立走进球分支；它的 else 要与自己保持相同缩进。'),hint(/^\s*else\s*:/,'这是条件不成立时走的分支，必须与 if 对齐，不能两套结果都执行。'),hint(/\w+\s*=\s*\w+\s*\+\s*1/,'这一行只在进球分支里更新比分，扑出时不会执行。'),hint(/^\s+forward\s*\(/,'这一行仍在 for 里、但在 if/else 外，所以每一轮都会前进。')],
      chipMap:{if_else:['else 要和谁对齐？','为什么每轮结果不同？','还是不懂'],counter:['为什么四轮后不是每场都4分？','我改好了，帮我看看'],loop_scope:['为什么只有进球才前进？','解释这一行'],random:['为什么 if 和 else 只走一个？','看看运行结果']},
      result:'四轮应有四句结果播报，进球与扑出合计为 4。轨迹应每轮都有前进；若移动次数少，检查 forward 是否被误放进某个分支。',
      modify:'想改成六轮点球，只把 range(4) 改成 6，再把成功条件和两类播报换成自己的规则。if/else 对齐和每轮 forward 的结构保持不变。'
    },
    27:{
      title:'冠军战术板',concept:'旧知识小项目',placeholder:'比如：三个必需模块先做什么？',
      chips:['大任务先做什么？','怎样先做最小版本？','三个必需模块是什么？','帮我看看代码'],
      rules:[
        {id:'minimal',phrases:['最小版本','先完成','太多','简化','必需模块']},
        {id:'start_task',phrases:['大任务','战术板','项目','模块','先做什么','拆解']},
        {id:'def_call',phrases:['def','函数','工具','定义','调用']},
        {id:'for_in',phrases:['for-in','for in','列表','名单','点名']},
        {id:'if_else',phrases:['if','else','条件','分支']}
      ],
      required:[
        step('def','一个函数工具',/def\s+\w+\s*\(/,'先做一个最简单的 def 工具并调用一次，确认它能动。','先完成至少一个 def 工具；定义后要有调用。'),
        step('for_in','列表点名',/for\s+\w+\s+in\s+(?!range)/,'再准备一张列表，用 for-in 逐个播报。','还缺列表配 for-in 点名模块。'),
        step('if_else','二选一判断',c=>/\bif\b/.test(c)&&/^\s*else\s*:/m.test(c),'第三个核心模块是 if/else，处理一种比赛结果。','还缺 if/else 二选一，两条分支要分别处理结果。'),
        step('prints','至少四句播报',c=>(c.match(/\bprint\s*\(/g)||[]).length>=4,'核心模块能运行后，把播报补到至少 4 句。','作品还需要至少 4 句 print 播报。'),
        step('colors','至少两种颜色',c=>(c.match(/\bpencolor\s*\(/g)||[]).length>=2,'再换两种 pencolor，让不同环节更清楚。','还缺至少两种画笔颜色。'),
        step('turns','至少三次转弯',c=>(c.match(/\b(?:left|right)\s*\(/g)||[]).length>=3,'最后补至少 3 次 left/right，完成自己的战术路线。','还缺至少 3 次转弯，路线要体现你的战术。')
      ],
      responses:{
        minimal:['最小版本先只做三个必需模块：一个 def 工具、一张列表配 for-in、一个 if/else。每完成一个就运行，再补颜色和转弯。','不用一开始追求完整比赛。先让“工具能动、名单能播、结果能判断”这三件事各自工作。','现在只选一个未完成模块，不要同时写三个；完成后再让我审查。'],
        def_call:['def 负责把一套动作做成工具，调用才让它在比赛中执行。先把工具做简单，确认能用，再接到战术里。','定义写一次，调用可按战术多次使用；改工具身体，所有调用都会得到新动作。'],
        for_in:['列表装球员或比赛环节，for-in 每次直接取出一项。它适合开场点名或逐个播报，不需要编号。','先创建列表，再 for item in list:，身体里使用当前 item。'],
        if_else:['if/else 负责一种比赛结果的二选一，例如比分领先与继续加油。条件成立走 if，否则走 else。','先选一个有意义的判断，再把两种结果各写一句播报；else 和 if 对齐。']
      },
      lineHints:[hint(/^def\s+|^\s*def\s+/,'这是项目的动作工具模块。定义之后还要在外面调用，才会进入比赛流程。'),hint(/for\s+\w+\s+in\s+/,'这是列表点名模块，当前项可以在循环身体里播报或使用。'),hint(/^if\s+|^\s+if\s+/,'这是比赛的二选一规则，条件成立走这一路，另一种情况交给 else。')],
      chipMap:{minimal:['三个必需模块是什么？','帮我看看代码','还是不懂'],def_call:['定义和调用有什么不同？','大任务先做什么？'],for_in:['怎样拼接播报？','帮我看看代码'],if_else:['else 要和谁对齐？','看看运行结果']},
      result:'按三个核心模块验收，再看作品表现：至少 4 句播报、2 种颜色、3 次转弯。先补缺失模块，再增加剧情，不必比较代码长短。',
      modify:'扩展战术板时一次只加一个情节：新增一名球员只改列表，新增一种结果只改 if/else，新增动作优先复用 def。每次修改后运行验证。'
    },
    28:{
      title:'数据记分牌',concept:'数字列表＋累加',placeholder:'比如：total=total+g 怎么算出总数？',
      chips:['total=total+g 是什么意思？','为什么 total 先装 0？','数字列表要加引号吗？','帮我看看代码'],
      rules:[
        {id:'accumulate',phrases:['累加','合计','总数','total','怎么算']},
        {id:'number_list',phrases:['数字列表','引号','goals','数字直接']},
        {id:'for_in',phrases:['for-in','for in','g 是','g是什么','逐个','列表']},
        {id:'loop_scope',phrases:['最后','循环后','对齐','只播一次','print(total)','1、3、4']},
        {id:'counter',phrases:['先装 0','先装0','为什么是 0','初始值']}
      ],
      required:[
        step('list','数字列表',/=\s*\[[^\]]*\d[^\]]*\]/,'先写 goals = [1,2,1]，数字不戴引号。','先准备数字列表，每场比赛的进球数直接写数字。'),
        step('counter','合计盒子',/\btotal\s*=\s*0\s*$/m,'再写 total = 0，表示还没把任何一场加进去。','还缺 total = 0 的合计起点。'),
        step('for_in','逐场取数据',/for\s+\w+\s+in\s+(?!range)/,'写 for g in goals:，g 每场依次是 1、2、1。','还缺 for-in 逐场取出进球数。'),
        step('accumulate','累加并存回',/\btotal\s*=\s*total\s*\+\s*\w+/,'循环里写 total = total + g，把每场进球加进合计并存回。','还缺 total = total + g；只写 total + g 不会保存。'),
        step('final','循环后播合计',/^print\s*\(\s*total\s*\)\s*$/m,'最后让 print(total) 顶格和 for 对齐，全部加完再播总数。','最后还缺循环外的 print(total)。')
      ],
      responses:{
        accumulate:['total = total + g 的意思是：取出原来的合计，加上本场 g，再存回 total。三场 g 是 1、2、1，total 就依次从 0 变 1、3、4。','像往同一个记分本上逐场记账：不是只算一下，而是每算完都写回本子，下一场接着累计。','只记三步：旧 total + 当前 g → 得到新合计 → 用 total = 存回。'],
        number_list:['数字列表直接写 goals = [1,2,1]，数字不戴引号。戴了引号会变成文字，累加时就可能变成拼接或报错。','列表是每场比赛的数据，g 是本轮取出的一场数字；total 是所有已处理比赛的合计。'],
        for_in:['for g in goals: 每轮直接取出一场进球数。g 不是编号，而是 1、2、1 这些数据本身。','第一轮 g=1，第二轮 g=2，第三轮 g=1；每一轮都执行一次 total = total + g。'],
        counter:['total = 0 是记账起点，表示还没加上任何比赛。没有初始值，第一次 total + g 就找不到旧合计。','0 不会改变总进球数，所以适合作为累加起点。'],
        loop_scope:['print(total) 要和 for 对齐，等所有比赛都加完再播最终合计。','如果缩进在循环里，会播出中间合计 1、3、4；循环外只播最后的 4。']
      },
      lineHints:[hint(/\btotal\s*=\s*total\s*\+\s*\w+/,'这一行取出旧合计，加上本轮 g，再存回 total。它是累加器的核心。'),hint(/for\s+\w+\s+in\s+/,'这一行逐场取出数字，g 是本场进球数，不是场次编号。'),hint(/^print\s*\(\s*total\s*\)/,'这一行在全部累加完成后播报最终合计，所以与 for 对齐。')],
      chipMap:{accumulate:['为什么 total 先装 0？','g 是编号还是进球数？','还是不懂'],number_list:['total=total+g 是什么意思？','我改好了，帮我看看'],for_in:['total 每轮怎么变化？','再举个例子'],counter:['total=total+g 是什么意思？','解释这一行'],loop_scope:['为什么出现 1、3、4？','看看运行结果']},
      result:'最后播报应是各场数字之和；若出现中间合计，检查 print(total) 缩进。若数字被拼接或报错，检查列表中的数字是否误戴引号。',
      modify:'想换成自己的四场战绩，只改 goals 列表中的四个数字，累加结构不变。还可以逐场 print(g)，让结果同时显示每场进球和最终合计。'
    },
    29:{
      title:'比分裁判',concept:'变量比较＋if/else',placeholder:'比如：两个变量能直接比较吗？',
      chips:['两个变量能直接比较吗？','home>away 是什么意思？','else 什么时候执行？','帮我看看代码'],
      rules:[
        {id:'compare_variables',phrases:['两个变量','比较','home','away','>','比分','谁领先']},
        {id:'if_else',phrases:['if','else','否则','什么时候执行','分支','打平']},
        {id:'variable',phrases:['变量','盒子','换比分']},
        {id:'loop_scope',phrases:['forward','判断后','外面','每轮','两种结果都会前进']}
      ],
      required:[
        step('scores','两队比分',c=>/\bhome\s*=\s*\d+/.test(c)&&/\baway\s*=\s*\d+/.test(c),'先写 home = 2 和 away = 1，分别装两队比分。','先准备 home、away 两个数字变量。'),
        step('if','变量比较',/\bif\s+home\s*>\s*away\s*:/,'再写 if home > away:，判断主队是否领先。','还缺 if home > away: 的变量比较。'),
        step('else','另一结果',/^\s*else\s*:/m,'让 else: 和 if 对齐，处理不领先的情况。','还缺 else 分支处理另一种比赛结果。'),
        step('prints','分支播报',c=>(c.match(/\bprint\s*\(/g)||[]).length>=2,'两个分支各写一句 print，分别播报胜利和继续加油。','两个分支都要有清楚的播报。'),
        step('forward','判断后前进',/\bforward\s*\(/,'分支结束后写 forward(60)，不管哪种结果都前进。','最后补判断后的 forward 动作。')
      ],
      responses:{
        compare_variables:['可以直接比较。home > away 会先取出两个盒子里的数字，再判断主队是否领先。比分改变后，判断句式不用重写。','home=2、away=1 时，2>1 成立走 if；换成 home=1、away=2，就不成立走 else。变量让同一套规则适应不同比分。','只记：两个盒子也能比大小。先装数字，再 if home > away:。'],
        if_else:['if 条件成立走胜利分支，否则走 else。两条路只走一条，完成后继续执行分支外的代码。','else 不单独判断新条件，它接住 home > away 不成立的所有情况，包括主队落后或打平。','else 与 if 对齐，两个分支里的 print 再缩进。'],
        variable:['home 和 away 是两个独立盒子，分别保存两队数字比分。只改盒子的内容，就可以复用同一个裁判规则。','不要把 home、away 戴引号，否则就变成比较固定文字，而不是取出比分。'],
        loop_scope:['forward 放在 if/else 外面，所以不管走了哪个分支，判断完成后都会前进。','它如果缩进在某一分支，就只会在那种结果下移动。']
      },
      lineHints:[hint(/^if\s+home\s*>\s*away\s*:/,'这一行取出两队数字比分并比较。home 更大走 if，否则走 else。'),hint(/^\s*else\s*:/,'这是主队没有领先时走的分支，包括落后和打平。'),hint(/^forward\s*\(|^\s*forward\s*\(/,'这是分支结束后的共同动作，两种比赛结果都会执行。')],
      chipMap:{compare_variables:['打平时走哪一边？','else 什么时候执行？','还是不懂'],if_else:['else 要和谁对齐？','看看运行结果'],variable:['换比分后要改 if 吗？','我改好了，帮我看看'],loop_scope:['为什么两种结果都会前进？','解释这一行']},
      result:'根据当前 home、away 核对是否播报了正确结果。若更换比分后播报不变，检查是否真正重新赋值，以及 print 是否放在对应分支。',
      modify:'想改成自己的两场比赛，可以在第一场判断和前进后，重新给 home、away 赋值，再复用同样的 if/else。两场比分要确实不同，便于观察分支变化。'
    },
    30:{
      title:'球迷采访团',concept:'input＋列表＋拼接',placeholder:'比如：怎样把回答放进列表播报？',
      chips:['怎样把回答放进列表播报？','fan 和 team 各是什么？','哪些内容要加引号？','帮我看看代码'],
      rules:[
        {id:'input',phrases:['input','输入','回答','采访','观众','球迷']},
        {id:'for_in',phrases:['for-in','for in','列表','team','teams','逐个']},
        {id:'string_join',phrases:['拼接','连接','放进列表播报','专属','加油']},
        {id:'quotes',phrases:['引号','哪些内容','变量名']},
        {id:'variable',phrases:['fan','变量','盒子']}
      ],
      required:[
        step('input','保存观众回答',/\b\w+\s*=\s*input\s*\(/,'先写 fan = input("你叫什么名字？")，把回答保存进 fan。','先用 input 提问并把回答保存进变量。'),
        step('list','球队列表',/=\s*\[[^\]]*\]/,'再准备 teams = ["火箭队","银河队"]。','还缺要逐个播报的球队列表，先写 teams = ["火箭队","银河队"]。'),
        step('for_in','逐队取出',/for\s+\w+\s+in\s+(?!range)/,'写 for team in teams:，team 每轮是当前队名。','还缺 for-in 逐队取出 team。'),
        step('join','回答与队名拼接',/\+/,'循环里用 + 把 fan、固定文字和 team 接成专属播报。','还要把 fan 和 team 一起拼进 print，固定文字戴引号。'),
        step('print','逐队播报',/\bprint\s*\(/,'把拼好的内容交给 print，每支球队播一句。','还缺循环里的 print 播报。'),
        step('forward','结束后前进',/\bforward\s*\(/,'最后补 forward(50)，播报结束后进入球场。','最后补一个前进动作完成作品。')
      ],
      responses:{
        input:['fan = input(...) 把观众回答保存进 fan。后面的每一轮列表播报都可以使用同一个 fan，所以每句都带这位观众的名字。','像先采访一次记下名字，再为多支球队制作专属加油稿；不需要每轮重新问一次。','只记：先 fan=input，再 teams 列表，最后循环里同时使用 fan 和 team。'],
        for_in:['team 是本轮取出的队名，teams 是整张球队列表。fan 在循环里保持不变，team 每轮变化。','第一次 team 是火箭队，第二次是银河队；fan 始终是刚才观众输入的名字。'],
        string_join:['print(fan + " 为 " + team + " 加油！") 把观众名、固定文字、当前队名和祝福语接成一句。两个变量分工不同。','读拼接时按片段拆开：fan 是观众，team 是本轮球队，中间带引号的文字负责把句子连自然。','固定文字戴引号，fan 和 team 是盒子不戴引号，所有片段用 + 接起来。'],
        quotes:['fan、team 是装内容的变量，不戴引号；" 为 "、" 加油！" 是原样文字，要戴引号。','如果写 print("fan")，只会念出 fan 三个字母，不会念出观众名字。'],
        variable:['fan 保存采访回答，team 保存本轮队名。一个来自 input，一个来自 for-in，两个盒子可以在同一句拼接里合作。']
      },
      lineHints:[hint(/=\s*input\s*\(/,'这一行把观众回答保存进 fan，后面的所有列表轮次都可以重复使用。'),hint(/for\s+\w+\s+in\s+/,'这一行逐个取出队名，team 每轮变化，fan 不受循环影响。'),hint(/print\s*\(.+\+/,'这一行同时使用 fan 和 team 拼出专属播报，固定文字要戴引号。')],
      chipMap:{input:['fan 和 team 各是什么？','怎样把回答放进列表播报？','还是不懂'],for_in:['fan 为什么不变？','看看运行结果'],string_join:['哪些内容要加引号？','解释这一行','我改好了，帮我看看'],quotes:['fan 和 team 各是什么？','文字怎么拼接？']},
      result:'每支球队都应出现一句带同一位观众名字的播报。若只念出 fan 或 team，检查变量是否误戴引号；若缺少回答，检查 input 是否先保存。',
      modify:'想增加采访内容，可以新增 wish=input(...) 并用另一个变量保存，再把它拼进播报。想增加球队，只改 teams 列表，不用增加循环代码。'
    },
    31:{
      title:'随机阵容',concept:'choice＋循环',placeholder:'比如：为什么每轮都能重新抽颜色？',
      chips:['怎样连续抽签？','为什么每轮要重新保存 c？','抽到的颜色怎么用？','帮我看看代码'],
      rules:[
        {id:'choice',phrases:['choice','抽签','抽颜色','抽一个','随机阵容','抽到的颜色怎么用']},
        {id:'random_variable',phrases:['保存 c','装进 c','结果装','为什么要装','赋值','颜色不一致','播报和颜色']},
        {id:'loop_scope',phrases:['每轮','循环里','缩进','重复抽','forward','只画了一段']},
        {id:'range',phrases:['range','循环','次数','连续']},
        {id:'random',phrases:['random','随机','相同']}
      ],
      required:[
        step('list','颜色候选',/=\s*\[[^\]]*\]/,'先准备 colors = ["red","gold","blue","green"]。','先创建供抽签的颜色列表。'),
        step('for','三轮抽签',/for\s+\w+\s+in\s+range\s*\(/,'再写 for i in range(3):，准备连续抽 3 次。','还缺固定轮次的 for 循环，先写 for i in range(3):。'),
        step('choice','每轮抽签',/=\s*random\s*\.\s*choice\s*\(/,'循环里写 c = random.choice(colors)，每轮重新抽并保存。','还缺循环里的 random.choice，并保存到 c。'),
        step('pen','使用本轮颜色',/\bpencolor\s*\(\s*\w+\s*\)/,'同一轮写 pencolor(c)，使用刚抽到的颜色。','抽到的 c 要交给 pencolor，c 不戴引号。'),
        step('print','播报本轮颜色',/\bprint\s*\(\s*\w+\s*\)/,'再写 print(c)，播报同一个抽签结果。','还缺 print(c) 播报本轮颜色。'),
        step('forward','每轮画一段',/\bforward\s*\(/,'forward 也缩进在循环里，三轮就有三段轨迹。','还缺循环里的 forward，让每轮颜色真正画出轨迹。')
      ],
      responses:{
        choice:['把 c = random.choice(colors) 放进 for 循环，每轮都会从 colors 重新抽一项并保存到 c。','像每轮把手伸回袋子重新抽一张；抽完要立即用 c 换色、播报和前进，再进行下一轮。','只记循环里的顺序：抽 c → pencolor(c) → print(c) → forward。'],
        random_variable:['c 保存“这一轮”抽到的颜色。后面的 pencolor(c) 和 print(c) 都读取同一个 c，保证画出来和播出来一致。','如果换色时又写一次 random.choice，可能重新抽到另一项，播报和轨迹就不一致。'],
        loop_scope:['抽签、换色、播报、前进都要缩进在循环里，才能每轮完整执行。少缩进一项，它就只在循环前或后做一次。','forward 在循环里，三轮画三段；移出循环就只画一段。'],
        range:['range(3) 决定抽 3 轮，i 只是计数器。真正每轮变化的是重新抽到的 c。','想抽 4 轮只改 range 的数字，列表和抽签句式不变。'],
        random:['随机允许连续抽到相同颜色，所以三轮颜色不保证互不相同。候选列表决定可能抽到什么。','想验证随机，可多运行几次比较，不要要求每一轮都必须不同。']
      },
      lineHints:[hint(/random\s*\.\s*choice/,'这一行在本轮重新抽一个列表项，并保存到 c；后续操作要使用同一个 c。'),hint(/pencolor\s*\(\s*\w+\s*\)/,'这里把本轮抽到的颜色交给画笔，变量名不需要引号。'),hint(/^\s+forward\s*\(/,'这一行缩进在循环里，所以每抽一次颜色就画一段轨迹。')],
      chipMap:{choice:['为什么每轮要重新保存 c？','抽到的颜色怎么用？','还是不懂'],random_variable:['为什么播报和颜色不一致？','解释这一行'],loop_scope:['为什么只画了一段？','我改好了，帮我看看'],range:['怎样连续抽签？','我想改成四轮'],random:['为什么连续抽到相同颜色？','看看运行结果']},
      result:'应看到三段轨迹和三句颜色播报，且同一轮使用的颜色一致。重复颜色是合法随机结果；若只出现一段，检查循环缩进。',
      modify:'想抽队长，可以先准备 players，再用 captain=random.choice(players) 抽一次并 print。想增加颜色候选，只改 colors 列表。'
    },
    32:{
      title:'智能射门工具',concept:'函数参数＋if/else',placeholder:'比如：函数里的 if 为什么会变结果？',
      chips:['函数里的 if 为什么会变结果？','li 参数怎么流动？','定义和调用有什么不同？','帮我看看代码'],
      rules:[
        {id:'parameter',phrases:['参数','旋钮','li','力度','怎么流动']},
        {id:'if_else',phrases:['if','else','判断','变结果','大力','推射','30 和 80','结果不同']},
        {id:'def_call',phrases:['def','函数','定义','调用','工具']},
        {id:'loop_scope',phrases:['函数里','缩进','外面','对齐','两种力度','都会前进']}
      ],
      required:[
        step('def','带参射门工具',/def\s+\w+\s*\(\s*\w+\s*\)/,'先写 def shemen(li):，li 是力度旋钮。','先定义一个带参数的射门工具。'),
        step('if_else','力度判断',c=>/\bif\s+\w+\s*>=\s*\d+/.test(c)&&/^\s*else\s*:/m.test(c),'函数里写 if li >= 60: 和 else:，分别播报大力与推射。','还缺函数内部的 if/else 力度判断。'),
        step('forward','参数控制动作',/forward\s*\(\s*\w+\s*\)/,'分支后写 forward(li)，并让它仍缩进在 def 里。','还要用 forward(li) 让参数真正控制距离。'),
        step('calls','不同力度调用',c=>(c.match(/^\w+\s*\(\s*\d+\s*\)\s*$/gm)||[]).filter(x=>!/^(forward|print|right|left|pencolor)/.test(x)).length>=2,'最后顶格写 shemen(30) 和 shemen(80)，观察同一工具的两种结果。','还缺至少两次不同数字的调用；调用时不要写 def。')
      ],
      responses:{
        parameter:['调用 shemen(30) 时，30 暂时流进 li；调用 shemen(80) 时，li 又变成 80。函数里的 if 和 forward 每次都读取本轮 li。','li 像工具上的力度旋钮：定义时只写旋钮名，调用时才拧入数字，所以同一工具能处理不同力度。','记流向：调用括号里的数字 → li → if 判断和 forward(li)。'],
        if_else:['函数身体也是一段程序，可以放 if/else。每次调用 li 不同，if li >= 60 的结果就可能不同，因此播报会变化。','30<60 走 else 的轻巧推射，80>=60 走 if 的大力射门；函数定义没有改，只是本轮参数不同。','if/else 在 def 里，分支身体再缩进一层；分支后的 forward(li) 两种力度都会执行。'],
        def_call:['def 是做工具，shemen(30) 是用工具。定义只建立规则，调用才把具体力度送进去并真正执行。','先定义再调用；调用时不用 def，括号里填数字而不是参数名。'],
        loop_scope:['if/else 和 forward 都属于函数，要缩进在 def 里。分支内部 print 再缩进，forward 与 if 对齐就能两种结果都执行。','调用 shemen(30) 顶格写，不属于 def 身体；否则可能变成定义时的一部分。']
      },
      lineHints:[hint(/^def\s+|^\s*def\s+/,'这一行定义带力度参数的工具。参数名先写在括号里，具体数字留到调用时。'),hint(/^if\s+|^\s+if\s+/,'这一行读取本次调用传进来的 li，根据力度选择分支。'),hint(/forward\s*\(\s*\w+\s*\)/,'这一行用本轮 li 控制实际距离，两种分支结束后都会执行。'),hint(/^\w+\s*\(\s*\d+\s*\)/,'这是带数字的工具调用，数字会流进函数参数。')],
      chipMap:{parameter:['函数里的 if 为什么会变结果？','定义和调用有什么不同？','还是不懂'],if_else:['为什么 30 和 80 结果不同？','li 参数怎么流动？','还是不懂'],def_call:['li 参数怎么流动？','我改好了，帮我看看'],loop_scope:['为什么两种力度都会前进？','我改好了，帮我看看']},
      result:'两次不同力度调用应有对应播报和不同距离。若播报变了但距离一样，检查 forward 是否仍写固定数字；若没执行，检查是否忘记调用。',
      modify:'想增加 chuan(li)，可以复用“参数→判断→动作”的结构，但把阈值和播报改成长传短传。两个工具做好后按自己的战术组合调用。'
    },
    33:{
      title:'夺冠之路',concept:'while＋随机＋分支',placeholder:'比如：失败了为什么还能继续？',
      chips:['失败了为什么还能继续？','为什么只有胜利才 wins+1？','夺冠播报为什么只出现一次？','帮我看看代码'],
      rules:[
        {id:'counter',phrases:['wins','胜利才','加1','加 1','胜场','计数']},
        {id:'loop_scope',phrases:['夺冠','只出现一次','循环外','对齐','最后','每轮都前进']},
        {id:'infinite_loop',phrases:['死循环','停不下来','一直跑','不会停']},
        {id:'if_else',phrases:['if','else','失败','胜利','分支','继续']},
        {id:'event_loop',phrases:['while','事件循环','挑战','一直']},
        {id:'random',phrases:['random','随机','骰子','轮数不同']}
      ],
      required:[
        step('counter','胜场盒子',/\bwins\s*=\s*0\s*$/m,'先写 wins = 0，目标是从 0 开始赢满 3 场。','先准备从 0 开始的胜场盒子 wins。'),
        step('while','持续挑战',/\bwhile\s+wins\s*</,'再写 while wins < 3:，没达到目标就继续。','还缺 while wins < 3 的持续挑战。'),
        step('random','每轮随机',/=\s*random\s*\.\s*randint\s*\(/,'循环里每轮保存 dice = random.randint(1,6)。','每轮先用 random 产生并保存结果。'),
        step('if_else','胜负分支',c=>/\bif\s+\w+\s*>=\s*\d+/.test(c)&&/^\s*else\s*:/m.test(c),'用 if/else 分别播报胜利和继续训练。','还缺 if/else 处理每轮胜负两种结果。'),
        step('increment','胜利才加胜场',/\bwins\s*=\s*wins\s*\+\s*1/,'只在 if 胜利分支写 wins = wins + 1。','只有胜利分支才能增加 wins，否则目标永远无法正确达到。'),
        step('feedback','每轮反馈与移动',c=>/\bprint\s*\(/.test(c)&&/\bforward\s*\(/,'两个分支都要有反馈，forward 缩进在 while 里让每轮移动。','补齐每轮播报和移动。'),
        step('final','循环后夺冠',/\bwhile\b[\s\S]*^print\s*\(/m,'最后的夺冠 print 顶格和 while 对齐，赢满后才执行。','还缺循环后的夺冠播报，不能放进 while 每轮重复。')
      ],
      responses:{
        if_else:['每轮 if/else 只走一边：胜利时 wins+1，失败时 else 只播报、不加胜场。所以失败后 wins 仍小于 3，while 会继续挑战。','失败不是退出循环，而是本轮没有接近目标。程序给“继续训练”的反馈后，开始下一轮随机挑战。','记住分工：random 决定本轮，if/else 处理结果，wins 记录目标进度。'],
        counter:['wins = wins + 1 只在胜利分支执行。失败不增加，达到 3 场胜利后 while 条件不再成立。','如果失败也加 1，三轮就必定结束，不能代表真正赢满三场；如果胜利也不加，就会一直循环。'],
        event_loop:['while wins < 3: 让挑战持续到目标完成。每轮需要几轮并不固定，因为 random 可能连续成功或失败。','这是事件循环：开始一轮 → 随机事件 → 判断胜负 → 更新进度或反馈 → 再检查目标。'],
        infinite_loop:['一直停不下来时，优先检查 wins = wins + 1 是否在胜利分支、是否写成了存回形式，以及胜利条件是否可能成立。','forward 和 print 不会改变 wins。只有明确执行 wins = wins + 1，while 才会逐步接近结束。'],
        loop_scope:['最后的夺冠 print 与 while 对齐，只有循环结束后才执行一次。每轮 forward 则缩进在 while 里。','如果夺冠 print 缩进在 while 里，还没赢满也可能反复播报；顶格才会等到真正夺冠。'],
        random:['random 让每轮胜负不确定，所以达到 3 胜所需轮数不固定。连续失败或连续胜利都可能发生。','它只产生本轮骰子，是否获胜由 if 判断，是否接近夺冠由 wins 决定。']
      },
      lineHints:[hint(/^while\s+|^\s*while\s+/,'这一行检查胜场是否达到目标，未达到就执行完整的一轮挑战。'),hint(/\bwins\s*=\s*wins\s*\+\s*1/,'这一行只在胜利分支把旧胜场加 1 并存回，是循环最终能停止的关键。'),hint(/^print\s*\(/,'顶格的最终 print 在 while 结束后执行，所以夺冠只播报一次。'),hint(/^\s+forward\s*\(/,'这一行仍在 while 里，每轮无论胜负都会前进。')],
      chipMap:{if_else:['为什么只有胜利才 wins+1？','失败了为什么还能继续？','还是不懂'],counter:['一直停不下来怎么办？','夺冠播报为什么只出现一次？'],event_loop:['失败了为什么还能继续？','为什么每次轮数不同？'],infinite_loop:['wins+1 写在哪里？','我改好了，帮我看看'],loop_scope:['为什么每轮都前进？','解释这一行'],random:['为什么每次挑战轮数不同？','看看运行结果']},
      result:'胜利和训练播报的总轮数可能大于 3，因为失败不计胜场；最后夺冠只应在赢满后出现一次。若一直不结束，检查 wins 更新。',
      modify:'想改成四胜联赛，把 while 目标改成 4，并可调整胜利阈值。也可以修改两类播报，但保持“胜利才加 1、循环后才夺冠”的结构。'
    },
    34:{
      title:'足球编程宇宙',concept:'自由收官项目',placeholder:'比如：自由项目先完成哪个最小版本？',
      chips:['自由项目先做什么？','怎样先做最小版本？','必需模块怎么组合？','帮我看看代码'],
      rules:[
        {id:'minimal',phrases:['最小版本','先完成','太多','简化','最长','必需模块']},
        {id:'start_task',phrases:['自由项目','收官','宇宙','大任务','模块','先做什么','拆解']},
        {id:'input',phrases:['input','输入','互动','观众','用于作品']},
        {id:'for_in',phrases:['for-in','for in','列表','点名']},
        {id:'param_def',phrases:['def','参数','函数','工具','定义和调用']},
        {id:'random',phrases:['random','随机','事件','结果不一样','结果不同']},
        {id:'if_else',phrases:['if','else','分支','判断']},
        {id:'counter',phrases:['变量统计','计数','统计','累加']}
      ],
      required:[
        step('input','一次观众互动',/\b\w+\s*=\s*input\s*\(/,'先做最小开场：一个 input 保存回答，再 print 使用它。','先补一次能保存并使用回答的 input 互动。'),
        step('for_in','列表与逐项处理',/for\s+\w+\s+in\s+(?!range)/,'再准备一张列表，用 for-in 点名或处理数据。','还缺一张列表配 for-in。'),
        step('def','带参数工具',/def\s+\w+\s*\(\s*\w+\s*\)/,'做一个带参数 def 并调用，让某个动作可复用。','还缺带参数的 def 工具，定义后要调用。'),
        step('random','一次随机事件',/\brandom\s*\./,'加入一次 random 并保存结果，给作品增加变化。','还缺 random 随机事件，结果要保存再使用。'),
        step('if_else','二选一规则',c=>/\bif\b/.test(c)&&/^\s*else\s*:/m.test(c),'根据随机或比分写 if/else，处理两种结果。','还缺 if/else 二选一规则。'),
        step('counter','变量统计',/\b\w+\s*=\s*\w+\s*\+\s*(?:\d+|\w+)/,'加入一个会从初始值开始更新的统计变量，例如 score=score+1。','还缺变量统计，先初始化再在合适位置更新。'),
        step('prints','至少五句播报',c=>(c.match(/\bprint\s*\(/g)||[]).length>=5,'核心规则能运行后，把各环节播报补到至少 5 句。','作品还需要至少 5 句 print 播报。'),
        step('colors','至少两种颜色',c=>(c.match(/\bpencolor\s*\(/g)||[]).length>=2,'再使用至少两种 pencolor 区分环节。','还缺至少两种轨迹颜色。'),
        step('turns','至少四次转弯',c=>(c.match(/\b(?:left|right)\s*\(/g)||[]).length>=4,'最后完成至少 4 次转弯的创作路线。','还缺至少 4 次转弯。')
      ],
      responses:{
        minimal:['先做能运行的最小版本：input 开场 → 一张列表逐项播报 → 一个带参工具 → 一次 random 和 if/else → 一个统计变量。之后再补画面和剧情。','自由创作不是把代码写得最长，而是让每个模块各自清楚、能运行，再组合。每完成一个模块就运行一次。','先选一个最小剧情，例如“观众入场—随机射门—统计进球—庆祝”，只实现这条主线。'],
        input:['input 是观众进入作品的入口。回答保存进变量后，可用于专属播报、拼接或后续规则。','先问一个真正会影响作品的问题，不要为凑语法而输入；保存后至少使用一次。'],
        for_in:['列表和 for-in 可负责球员点名、环节展示或数据统计。当前项直接取出，不需要编号。','先决定列表里装什么，再让循环身体对每项做一件清楚的事。'],
        param_def:['带参 def 负责可复用动作，参数让同一工具适应不同力度或距离。定义后要在作品流程中调用。','先保证工具单独能用，再把它组合进随机事件或庆祝环节。'],
        random:['random 负责制造变化，randint 产生数字，choice 抽列表项。保存本次结果后交给 if/else 或播报。','随机结果可以影响比赛规则，但不要在同轮反复随机导致播报和判断不一致。'],
        if_else:['if/else 把随机或比分变成两种明确结果。条件成立走一条，否则走另一条。','先写清楚判断规则，再给两条分支各自有意义的播报或统计。'],
        counter:['统计变量要先有初始值，再在对应事件发生时更新。进球统计只在进球分支加 1，累加则把当前数据存回合计。','变量统计让作品记住过程，而不是每轮都从零开始。']
      },
      lineHints:[hint(/=\s*input\s*\(/,'这是观众互动模块，回答保存后要在后续作品中真正使用。'),hint(/^def\s+|^\s*def\s+/,'这是可复用工具模块，括号里的参数让调用可以传入不同数字。'),hint(/random\s*\./,'这里产生一次随机事件，结果保存后可交给判断或播报。'),hint(/^if\s+|^\s+if\s+/,'这是作品的二选一规则，两种结果分别放在 if 和 else 身体里。'),hint(/\w+\s*=\s*\w+\s*\+\s*(?:\d+|\w+)/,'这一行更新统计变量，把新结果存回盒子，让作品记住进度。')],
      chipMap:{minimal:['必需模块怎么组合？','帮我看看代码','还是不懂'],input:['回答怎么用于作品？','自由项目先做什么？'],for_in:['列表能装什么？','怎样拼接播报？'],param_def:['参数怎么流动？','定义和调用有什么不同？'],random:['为什么每轮结果不同？','if/else 怎么配合？'],if_else:['else 要和谁对齐？','看看运行结果'],counter:['统计变量为什么先装 0？','我改好了，帮我看看']},
      result:'先验收核心模块，再看至少 5 句播报、2 种颜色、4 次转弯和一次真实互动。没有报错只是第一步，还要确认输入、随机、判断和统计都实际参与。',
      modify:'自由扩展时优先改自己的规则与剧情，而不是堆代码：换名单、改随机阈值、增加一句专属播报，或复用工具新增庆祝。一次只改一个模块并运行。'
    }
  };
  // 独立作业不是模仿答案的重复：按作业原文检查新增数量、条件与收尾。
  const count=(code,re)=>(String(code).match(re)||[]).length;
  const replaceStep=(list,id,next)=>list.map(s=>s.id===id?next:s);
  LEVEL_CONFIG[25].homeworkRequired=LEVEL_CONFIG[25].required.concat([
    step('celebration','两次转弯庆祝',c=>count(c,/\b(?:left|right)\s*\(/g)>=2,'最后补 forward 和至少两次 left/right，完成庆祝路线。','独立作业还缺至少两次转弯的庆祝路线。')
  ]);
  LEVEL_CONFIG[26].homeworkRequired=replaceStep(replaceStep(LEVEL_CONFIG[26].required,'for',
    step('for','六轮点球',/for\s+\w+\s+in\s+range\s*\(\s*6\s*\)/,'独立作业写 for i in range(6):，完成六轮点球。','独立作业需要六轮，请检查 range 里的次数。')),'if',
    step('if','五以上世界波',/\bif\s+\w+\s*>=\s*5/,'本轮骰子达到 5 才进入“世界波”分支。','独立作业的成功条件是 dice >= 5。')).concat([
    step('final','六轮后播总进球',/for\s+\w+\s+in\s+range\s*\(\s*6\s*\):[\s\S]*^print\s*\(\s*\w+\s*\)\s*$/m,'循环结束后顶格 print(goals)，只播报一次总进球。','还缺六轮结束后的总进球播报，不能每轮重复。')
  ]);
  LEVEL_CONFIG[28].homeworkRequired=replaceStep(LEVEL_CONFIG[28].required,'list',
    step('list','四场数字战绩',/=\s*\[\s*\d+(?:\s*,\s*\d+){3}\s*\]/,'独立作业准备四个数字，例如 goals = [2,0,1,3]。','独立作业需要恰好四场数字战绩。')).concat([
    step('round_print','逐场播报进球',/for\s+\w+\s+in\s+[^\n]+:\s*\n\s+print\s*\(/,'每轮先 print(g)，再累加 total；循环外还有最终合计。','还缺循环里的逐场进球播报。')
  ]);
  LEVEL_CONFIG[29].homeworkRequired=[
    step('scores','两场不同比分',c=>count(c,/\bhome\s*=\s*\d+/g)>=2&&count(c,/\baway\s*=\s*\d+/g)>=2,'分别给两场比赛重新设置 home 和 away。','独立作业需要两场比分，第二场要重新赋值。'),
    step('if','两场变量比较',c=>count(c,/\bif\s+home\s*>\s*away\s*:/g)>=2,'两场都用 if home > away: 判断。','还缺第二场的 if 比分判断。'),
    step('else','两场另一结果',c=>count(c,/^\s*else\s*:/gm)>=2,'每场 if 后都配一个对齐的 else。','还缺第二场的 else 分支。'),
    step('prints','两场结果播报',c=>count(c,/\bprint\s*\(/g)>=2,'两场分别播报对应结果。','还缺第二场比赛的结果播报。'),
    step('forward','两场分别前进',c=>count(c,/\bforward\s*\(/g)>=2,'每场判断结束后都前进一次。','还缺第二场判断后的前进动作。')
  ];
  LEVEL_CONFIG[30].homeworkRequired=replaceStep(replaceStep(LEVEL_CONFIG[30].required,'input',
    step('input','保存两次采访回答',c=>count(c,/\b\w+\s*=\s*input\s*\(/g)>=2,'分别用 fan、wish 保存两次 input 回答。','独立作业需要问两个问题，并分别保存回答。')),'list',
    step('list','三个比赛环节',/=\s*\[[^\]]*,[^\]]*,[^\]]*\]/,'准备包含三个环节的 events 列表。','独立作业需要三个比赛环节组成的列表。')).concat([
    step('answer_prints','回答与环节完整播报',c=>count(c,/^print\s*\(\s*\w+\s*\)\s*$/gm)>=2&&/for\s+\w+\s+in\s+[^\n]+:\s*\n\s+print\s*\(/.test(c),'先分别 print 两个回答，再在循环里用 print 播报每个环节。','还需要两句回答播报，以及循环里的环节播报。')
  ]);
  LEVEL_CONFIG[31].homeworkRequired=replaceStep(replaceStep(LEVEL_CONFIG[31].required,'for',
    step('for','四轮随机进攻',/for\s+\w+\s+in\s+range\s*\(\s*4\s*\)/,'抽完队长后，用 range(4) 进行四轮随机颜色进攻。','独立作业需要四轮颜色进攻。')),'choice',
    step('choice','队长与每轮颜色抽签',c=>count(c,/=\s*random\s*\.\s*choice\s*\(/g)>=2,'先从 players 抽队长，再在循环里抽颜色，两次结果分别保存。','还缺随机队长，或循环里的随机颜色。'));
  LEVEL_CONFIG[32].homeworkRequired=[
    step('defs','两个带参工具',c=>count(c,/def\s+\w+\s*\(\s*\w+\s*\)/g)>=2,'保留 shemen(li)，再定义 chuan(li)。','独立作业需要 shemen 和 chuan 两个带参工具。'),
    step('if_else','两个工具各自判断',c=>count(c,/\bif\s+\w+\s*>=\s*\d+/g)>=2&&count(c,/^\s*else\s*:/gm)>=2,'两个工具内部各写自己的 if/else 力度判断。','两个工具都要有自己的 if/else。'),
    step('forward','两个工具参数移动',c=>count(c,/forward\s*\(\s*\w+\s*\)/g)>=2,'两个函数身体都使用 forward(li)。','两个工具都要用参数控制移动。'),
    step('calls','混合调用至少三次',c=>{const defs=new Set(Array.from(c.matchAll(/def\s+(\w+)\s*\(\s*\w+\s*\)/g),m=>m[1]));const calls=Array.from(c.matchAll(/^\s*(\w+)\s*\(\s*(?:\d+|\w+)\s*\)\s*$/gm),m=>m[1]).filter(name=>defs.has(name));return calls.length>=3&&new Set(calls).size>=2;},'按自己的顺序混合调用两个工具至少三次。','独立作业需要两个工具都被真实调用，合计至少三次。')
  ];
  LEVEL_CONFIG[33].homeworkRequired=replaceStep(replaceStep(LEVEL_CONFIG[33].required,'while',
    step('while','四胜才停',/\bwhile\s+wins\s*<\s*4/,'独立作业写 while wins < 4:，赢满四场才停。','独立作业目标是四胜，请检查 while 目标。')),'if_else',
    step('if_else','五以上获胜',c=>/\bif\s+\w+\s*>=\s*5/.test(c)&&/^\s*else\s*:/m.test(c),'每轮骰子达到 5 才获胜，否则继续训练。','独立作业的胜利条件是 dice >= 5，并保留 else。')).concat([
    step('celebrate','冠军播报后再前进',/^print\s*\([^\n]+\)\s*\nforward\s*\(/m,'循环后的“星际冠军”播报之后，再补一次顶格 forward。','最后还缺冠军播报后的庆祝前进。')
  ]);
  Object.assign(base.LEVEL_CONFIG,LEVEL_CONFIG);
  Object.assign(base.INTENT_NAMES,{loop_scope:'循环内外与缩进',if_else:'if/else分支',accumulate:'累加器',number_list:'数字列表',compare_variables:'变量比较'});
  const api={LEVEL_CONFIG};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.Coach26_35=api;
})(typeof window!=='undefined'?window:globalThis);
