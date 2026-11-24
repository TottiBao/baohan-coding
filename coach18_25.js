/* 第18～25关情境问答：共享引擎 + 每关知识配置，不调用云端。 */
(function(root){
  'use strict';
  const FOLLOW=/还是不懂|没看懂|再简单|再详细|再解释|继续说|然后呢|换个说法|再提示|再举个例子/;
  const COMMON_RULES=[
    {id:'review_code',phrases:['帮我看看','检查我的代码','看看我的代码','我改好了','改完了','这样对吗','审查代码']},
    {id:'result_analysis',phrases:['运行结果','播报结果','输出结果','看看结果','运行后','只出来','只有一个','没有颜色','轨迹']},
    {id:'line_explain',phrases:['这一行','这行','这段代码','这段']},
    {id:'modify_task',phrases:['改成','换成','增加','多加','自己的','改一下','扩展']},
    {id:'start_task',phrases:['不知道怎么','不知道先','不会开始','先写什么','第一步','怎么开始','卡住','不会做','不懂怎么写']},
    {id:'indent',phrases:['缩进','空几格','几个空格','空格']},
    {id:'print',phrases:['print','打印','播报']},
    {id:'error_fix',phrases:['为什么报错','哪里错','报错','错误','不对','运行不了','不能运行','出问题']}
  ];
  const INTENT_NAMES={
    error_fix:'修复报错',line_explain:'解释代码行',indent:'缩进',print:'播报',start_task:'任务拆解',review_code:'代码审查',result_analysis:'结果分析',modify_task:'修改作品',clarify:'待明确问题',
    string_join:'字符串拼接',quotes:'文字与引号',number_text:'数字与文字',variable:'变量盒子',
    random:'随机概念',randint:'随机整数',choice:'列表抽签',difference:'概念对比',random_variable:'保存随机结果',
    input:'输入互动',while_if:'比赛循环',param_def:'带参函数',for_in:'列表点名',
    angle_formula:'多边形角度',polygon:'正多边形',range:'循环次数',
    nested:'嵌套循环',execution_count:'循环执行次数',outer_inner:'内外层计数器',
    event_loop:'事件循环',if_goal:'进球判断',counter:'计数更新',infinite_loop:'死循环',
    def_call:'定义与调用',parameter:'函数参数',multiple_functions:'函数组合',order:'调用顺序',
    minimal:'最小可行作品',while:'while循环'
  };
  function step(id,label,test,next,review){return {id,label,test,next,review:review||next};}
  function hint(re,text){return {re,text};}
  const LEVEL_CONFIG={
    17:{
      title:'进球解说词',concept:'字符串拼接',placeholder:'比如：文字为什么要戴引号？',
      chips:['文字怎么拼接？','为什么要加引号？','数字和文字能相加吗？','帮我看看代码'],
      rules:[
        {id:'number_text',phrases:['数字和文字','文字和数字','数字不能','混加','类型不一样']},
        {id:'string_join',phrases:['字符串拼接','文字拼接','拼接','接起来','文字接龙','加号','+ 号']},
        {id:'quotes',phrases:['引号','字符串','文字盒子','文字怎么装','变量名为什么']},
        {id:'variable',phrases:['变量','盒子','name 是','name是什么','jieri']}
      ],
      required:[
        step('text','文字变量',/\b[a-zA-Z_]\w*\s*=\s*["'][^"'\n]+["']/,'先只做一个文字盒子：name = "梅西"。文字戴上英文引号，先不写后面的拼接。','还没看到文字变量。先给球员名字做一个盒子，固定文字要戴英文引号。'),
        step('join','文字拼接',/\+/,'名字盒子有了。下一步只用 + 把 name 和 " 进球了！" 接起来，可以装进 jieri。','已经有文字了，但还没看到 + 拼接。把名字和一句固定解说词接起来。'),
        step('print','播报',/\bprint\s*\(/,'拼接已经有了，最后只补 print(jieri)，把拼好的句子播出来。','拼接完成后再用 print 播出结果；变量名外面不要加引号。')
      ],
      responses:{
        string_join:['字符串拼接就是“文字接龙”：+ 把左右两段文字接成一段。name 装着“梅西”，name + " 进球了！" 就变成一句完整解说。\n\n只有固定文字戴引号，name 是盒子名，不戴引号。','把 + 想成两块磁铁：左边吸住 name 里的文字，右边吸住 " 进球了！"。它们连在一起后，电脑才得到完整句子。\n\n先找出你代码里 + 的左边和右边分别是什么。','只记骨架：print(name + " 进球了！")。name 是盒子，" 进球了！" 是固定文字，+ 负责接头。'],
        quotes:['引号告诉电脑：“这里是一串原样文字”。name = "梅西" 里，梅西是文字所以要引号；后面的 print(name) 要取盒子里的内容，所以 name 不加引号。','想象“梅西”写在纸条上，引号就是纸条的包装。盒子名 name 像抽屉标签，不是要说出口的内容，所以不用再包引号。','判断口诀：电脑原样念出的文字戴引号；装着内容的变量名不戴引号。'],
        number_text:['数字和文字不能直接 +，因为 + 对数字是“算总数”，对文字是“接起来”，电脑不知道该选哪种。\n\n这一关先把数字和文字分别 print；要拼解说词时，让 + 两边都是文字。','一个像苹果，一个像盒子标签，不能直接拿苹果去接标签。先检查 + 左右：有引号或装着文字的盒子，才是文字；数字没有引号。','只改一处：把“进球 3 个”先作为一整段带引号的文字，或把数字和文字分成两次播报。'],
        variable:['变量就是一个有名字的盒子。name = "梅西" 是把文字装进 name；后面使用 name，就会取出“梅西”。把盒子里的内容换掉，拼接句式不用重写。','盒子名是地址，不是内容本身。print("name") 只会念出 name 四个字母；print(name) 才会念出盒子里的球员名。']
      },
      lineHints:[hint(/=\s*["']/,'这是在把一段文字装进变量盒子。等号左边是盒子名，右边带引号的才是文字内容。'),hint(/\+/,'这一行用 + 做文字接龙。逐段看看：变量取出盒子里的文字，带引号的部分保持原样。')],
      chipMap:{string_join:['为什么要加引号？','数字和文字能相加吗？','还是不懂'],quotes:['变量名为什么不加引号？','文字怎么拼接？','解释这一行'],number_text:['为什么要加引号？','我改好了，帮我看看'],variable:['print 要不要引号？','文字怎么拼接？']},
      result:'重点听播报：名字、空格和动作是否连成自然的一句话。如果念出了 name 这个单词，检查是不是误给变量名戴了引号。',
      modify:'想做自己的解说词，先只改文字盒子的内容，或改 + 后面的固定句子。拼接结构不用重写；独立作业再逐句增加不同的 print。'
    },
    18:{
      title:'幸运骰子',concept:'random 随机',placeholder:'比如：randint 和 choice 有什么不同？',
      chips:['randint 和 choice 有什么不同？','为什么每次结果不一样？','随机结果为什么要装进盒子？','帮我看看代码'],
      rules:[
        {id:'difference',phrases:['randint 和 choice','choice 和 randint','有什么区别','有什么不同','不一样']},
        {id:'random_variable',phrases:['为什么要装','装进盒子','保存随机','结果装','赋值']},
        {id:'randint',phrases:['randint','骰子','随机数字','随机数','1到6','1~6']},
        {id:'choice',phrases:['choice','抽签','抽取','抽一个','随机选']},
        {id:'random',phrases:['random','随机','运气','每次不一样','每次不同','结果不一样','再运行一次','相同的颜色']}
      ],
      required:[
        step('randint','随机整数',/=\s*random\s*\.\s*randint\s*\(/,'先只写 dice = random.randint(1,6)，把这次掷到的数字装进 dice。','先让 random.randint 掷一次骰子，并用 = 把结果装进盒子。'),
        step('print','随机结果播报',/\bprint\s*\(/,'随机数字有了，下一步只写 print(dice)，看看这次掷到几。','随机结果已经装进盒子，再用 print 播出来，才能看见它。'),
        step('list','候选列表',/=\s*\[[^\]]*\]/,'现在准备抽签名单：colors = ["red","gold","blue"]，先不做 choice。','choice 要从列表里抽签，先准备一张有候选项的列表。'),
        step('choice','列表抽签',/=\s*random\s*\.\s*choice\s*\(/,'列表有了，下一步用 c = random.choice(colors) 抽一项装进 c。','还缺 random.choice(列表) 抽签，抽到的结果也要装进变量。'),
        step('pen','使用抽到的颜色',/\bpencolor\s*\(/,'抽到颜色后用 pencolor(c) 把它交给画笔；c 不要加引号。','抽签结果还要用起来：把当前变量交给 pencolor。'),
        step('forward','画出轨迹',/\bforward\s*\(/,'最后补 forward(50)，让这次随机颜色真正画出一段轨迹。','颜色设置好了，再前进一步，运行结果里才能看到对应轨迹。')
      ],
      responses:{
        difference:['randint(1,6) 像掷骰子，直接给出一个 1～6 的数字；choice(colors) 像抽签，从已经准备好的列表里抽一项。\n\n一个“造出随机数字”，一个“从候选里随机挑”。','看结果就能分清：dice 里可能是 4，c 里可能是 "red"。需要数字力度用 randint；需要名字或颜色用 choice。','记法：randint 管数字，choice 管列表。两者前面都要写 random.，结果都要用 = 保存。'],
        randint:['random.randint(1,6) 每次随机给出一个 1 到 6 的整数，包含 1 和 6。把它装进 dice，后面的 print(dice) 才能播报同一次结果。','它像真的六面骰子：运行前不能指定一定出几。多运行几次是在做新实验，每次数字可能相同，也可能不同。','只记口令：dice = random.randint(1,6)。random. 是工具箱名字，randint 是掷骰子工具，dice 接住结果。'],
        choice:['random.choice(colors) 会从 colors 列表里随机抽一项。colors 必须先创建；抽到的结果装进 c，再用 pencolor(c) 或 print(c) 使用。','它像把候选颜色写成纸条放进袋子，每次闭眼抽一张。抽到什么不能提前要求，列表里每项都有机会。','只记顺序：先 colors 列表，再 c = random.choice(colors)，最后使用 c。'],
        random:['random 让程序每次运行时做一次随机选择，所以结果不固定。相同也可能连续出现，这并不代表随机失效。\n\n想验证变化，可以连续运行两三次，把每次播报分开比较。','随机不是“每次都必须不同”，而是“每次都不能提前确定”。就像掷骰子也可能连续两次都是 4。','本关记两种运气：randint 掷数字，choice 抽列表项。每次结果先装进盒子再使用。'],
        random_variable:['随机结果只出现一下，如果不装进盒子，后面就找不到“刚才那次”的结果。dice = random.randint(...) 把数字留住，print(dice) 才播报同一个数。','等号像给刚抽到的纸条贴上名字。没有名字，下一句就不知道去哪找这张纸条；有了 dice 或 c，就能反复使用本次结果。','只记：左边盒子 = 右边随机。先保存，再 print 或 pencolor，不要在不同行反复随机却以为是同一次。']
      },
      lineHints:[hint(/random\s*\.\s*randint/,'这一行在掷一次随机骰子，并把结果装进等号左边的盒子。1 和 6 都在可能范围里。'),hint(/random\s*\.\s*choice/,'这一行从括号里的列表随机抽一项，并把抽到的那项保存进变量；不是抽列表编号。'),hint(/pencolor\s*\(\s*\w+\s*\)/,'这里把刚刚抽到并保存的颜色交给画笔，变量名不用引号。')],
      chipMap:{difference:['随机结果为什么要装进盒子？','choice 怎么写？','还是不懂'],randint:['为什么每次结果不一样？','choice 又怎么抽？','解释这一行'],choice:['为什么抽到相同的颜色？','randint 和 choice 有什么不同？','看看运行结果'],random:['我想再运行一次对比','随机结果为什么要装进盒子？'],random_variable:['解释这一行','我改好了，帮我看看']},
      result:'这里展示的是“本次”随机结果，不要求固定，也不要求每次一定不同。可以再运行一次，对比播报数字和轨迹颜色有没有变化。',
      modify:'想增加抽签候选，只改 colors 列表，在方括号里多加一项并注意逗号；choice 那一行不用改。想改骰子范围，则只调整 randint 的两个数字。'
    },
    19:{
      title:'星际杯互动直播',concept:'综合项目',placeholder:'比如：这个大任务先拆哪一步？',
      chips:['大任务先做什么？','input 的回答怎么用？','while 负责什么？','帮我看看代码'],
      rules:[
        {id:'start_task',phrases:['大任务','综合项目','直播','模块','先做什么','怎么拆','拆解']},
        {id:'input',phrases:['input','输入','提问','回答','互动','观众']},
        {id:'param_def',phrases:['def','带参','参数','射门工具','旋钮','定义和调用']},
        {id:'while_if',phrases:['while','比赛循环','循环比赛','进3球','进 3 球','停不下来','停不下']},
        {id:'for_in',phrases:['for-in','for in','名单','列表','逐个播报','编号']},
        {id:'string_join',phrases:['拼接','解说词','字符串','数字和文字','相加']},
        {id:'random',phrases:['random','随机','事件','结果不一样','结果不同']}
      ],
      required:[
        step('input','开场互动',/\b\w+\s*=\s*input\s*\(/,'先做最小开场：fan = input("你支持哪队？")，再 print(fan)。其他模块先不写。','先补一个会保存回答的 input，让观众能参与，而不是只写裸 input。'),
        step('def','带参数射门工具',/def\s+\w+\s*\(\s*\w+\s*\)/,'开场能运行后，只做一个带参数的工具：def shemen(li):，身体用 forward(li)。','直播还缺一个带参数的 def 工具；先定义，再单独调用。'),
        step('while','比赛循环',/\bwhile\b/,'工具做好后，再搭 while 比赛循环。先让计数盒子从 0 开始，循环里要有更新。','还缺 while 比赛循环。先写目标和计数，再让每轮结果改变计数。'),
        step('for_in','名单播报',/for\s+\w+\s+in\s+(?!range)/,'比赛骨架能跑后，加入一张球员列表和 for-in 逐个播报。','还缺列表配 for-in 的名单播报；名单先创建，再逐个取出。'),
        step('join','实时解说词',/\+/,'名单能播报后，只用 + 把当前名字和一句解说词接起来。','解说词还没有拼接；把变量内容和固定文字用 + 接起来。'),
        step('random','随机事件',/\brandom\s*\./,'最后再加入 random 制造一次随机事件，不要一开始就把所有模块混在一起。','主体完成后再加 random，让比赛有悬念；随机结果要保存再判断。')
      ],
      responses:{
        input:['input 负责问观众，= 负责把回答保存进盒子，例如 fan = input("支持哪队？")。之后 print(fan) 或拼接时，使用的是观众刚刚输入的文字。','像记者采访：input 是提问，变量是采访记录本。只问不记，回答就丢了；记下来后，后面的模块都能使用。','只记：fan = input(问题)。fan 不戴引号，因为它是装回答的盒子；问题本身是固定文字，要戴引号。'],
        while_if:['while 负责让比赛一轮轮继续，例如还没进满 3 球就再赛一轮。循环里要有计数更新，达到目标后条件不再成立，比赛才结束。','它像裁判看比分：没达到目标就继续，达到了就停。random 和 if 可以决定本轮是否得分，计数只在成功时增加。','先写 goals = 0 和 while goals < 3:，再检查身体里有没有 goals = goals + 1。'],
        param_def:['带参 def 是可调节力度的工具。定义 def shemen(li): 时，li 是旋钮名；调用 shemen(80) 时，80 流进 li，函数里的 forward(li) 就走 80 步。','做工具写旋钮名字，用工具才填数字。定义只写一次，直播中可按不同力度多次调用。','先只做 shemen(li) 并调用一次，确认能动，再接进比赛循环。'],
        for_in:['for-in 负责把球员名单逐个取出播报。for name in players: 中，name 是当前球员本身，不是编号。','像直播开场逐个介绍首发：名单有三项，缩进里的 print 就执行三次。','先准备 players 列表，再 for name in players:，身体空 4 格写 print(name)。'],
        string_join:['拼接让解说词同时包含变量内容和固定文字，例如 print(name + " 进球了！")。name 每轮变化，固定文字保持不变。','把 + 两边分别读出来：左边是本轮拿到的名字，右边是要接上的解说。两边都必须是文字。'],
        random:['random 负责制造本轮悬念，randint 给数字，choice 从列表抽签。先保存本次结果，再让 if 判断或 print 播报。','随机是比赛事件的来源，while 是重复比赛的骨架，if 是裁判。三者分工不同，不要挤在一行理解。']
      },
      lineHints:[hint(/=\s*input\s*\(/,'这一行先向观众提问，再把本次回答保存进等号左边的变量。后面可以用这个变量做专属播报。'),hint(/^def\s+/,'这一行只是在定义直播中的一个工具，还不会自动执行。括号里的名字是参数旋钮，后面要单独调用。'),hint(/^while\s+/,'这一行决定比赛什么时候继续。循环身体必须让计数逐步接近目标，否则无法收官。')],
      chipMap:{input:['回答怎么放进解说词？','解释这一行','我改好了，帮我看看'],while_if:['为什么一直停不下？','random 负责什么？','大任务先做什么？'],param_def:['定义和调用有什么不同？','参数是什么？','帮我看看代码'],for_in:['name 是编号吗？','怎么拼解说词？'],string_join:['数字和文字能相加吗？','看看运行结果'],random:['while 负责什么？','为什么每次结果不一样？']},
      result:'按模块验收：有没有观众回答、至少 4 句播报、2 种颜色和足够转弯。先看哪个模块已经工作，再补下一个，不用一次追求所有特效。',
      modify:'扩展直播时一次只加一个模块：先加一句专属解说并运行，再加一种颜色或一次随机事件。每加一块就验证，出问题才知道刚改了哪里。'
    },
    20:{
      title:'角度魔法',concept:'循环与角度',placeholder:'比如：为什么五边形每次转 72°？',
      chips:['为什么五边形转 72°？','range 里为什么写 5？','图形合不上怎么办？','帮我看看代码'],
      rules:[
        {id:'angle_formula',phrases:['360','角度','72','108','公式','为什么转','除以','360÷','360/']},
        {id:'polygon',phrases:['多边形','五边形','六边形','三角形','闭合','合不上','图形']},
        {id:'range',phrases:['range','循环次数','几条边','边数','从 0','从0']}
      ],
      required:[
        step('for','按边数循环',/for\s+\w+\s+in\s+range\s*\(\s*\d+\s*\)/,'先只写 for i in range(5):，表示五边形要画 5 条边。','先按边数建立 for 循环；五边形的 range 里是 5。'),
        step('forward','相同边长',/\bforward\s*\(/,'循环有了，身体空 4 格写 forward(70)，每条边用相同长度。','循环身体里要有相同边长的 forward，每条边才一样长。'),
        step('right','正确转角',/\bright\s*\(/,'最后同样在循环里写 right(72)，因为 360÷5=72。','还缺每条边后的 right 转角；角度要用 360÷边数计算。')
      ],
      responses:{
        angle_formula:['沿着多边形走一圈，方向总共转过 360°。正多边形每个外角相同，所以每次转角 = 360÷边数。五边形就是 360÷5=72°。','把完整转身一圈平均分给 5 个角：360° 分成 5 份，每份 72°。正方形分成 4 份是 90°，三角形分成 3 份是 120°。','只记公式：转角 = 360÷边数。先写边数，再算角度；不要把五边形的内角 108° 填进 right。'],
        polygon:['正多边形要同时满足“边数对、每条边一样长、每次转角相同”。for 管边数，forward 管边长，right 管相同转角。','图形合不上时按顺序查三件事：range 是不是边数；forward 数字是否每次相同；right 是否等于 360÷边数且也在循环里。','五边形的最小骨架是 range(5)，身体里 forward(相同边长) 和 right(72)，两句都空 4 格。'],
        range:['range(5) 让循环执行 5 次，每轮画一条边，所以五边形写 5。i 依次是 0、1、2、3、4，虽然从 0 开始，但总数仍是 5。','这里 i 主要负责数“已经画了几条边”，真正让图形变化的是身体里的 forward 和 right。','边数是几，range 里就写几；角度则另算 360÷边数，两个数字不要混用。']
      },
      lineHints:[hint(/for\s+\w+\s+in\s+range/,'这一行按括号里的次数重复画边。五边形是 5 次，计数器从 0 开始不影响边数。'),hint(/^right\s*\(/,'这一行是画完一条边后转外角。正五边形应转 72°，它要在循环身体里才会每条边都转。'),hint(/^forward\s*\(/,'这一行画当前这条边。正多边形每轮使用相同边长，图形才规则。')],
      chipMap:{angle_formula:['为什么不是 108°？','range 里为什么写 5？','还是不懂'],polygon:['图形合不上怎么办？','看看运行结果','解释 right 这一行'],range:['为什么从 0 开始却是 5 次？','角度怎么算？']},
      result:'对照轨迹数边和转弯：五边形应看到 5 条有效边、至少 4 次转弯并接近闭合。若边数对却合不上，优先检查 right 的角度和缩进。',
      modify:'想把五边形改成六边形，要同时改两处：range(5) 改成 range(6)，right(72) 改成 right(60)。只改边数不改角度，图形仍会合不上。'
    },
    21:{
      title:'烟花矩阵',concept:'嵌套循环',placeholder:'比如：为什么 3×6 是 18 次？',
      chips:['外层和内层分别管什么？','为什么一共执行 18 次？','内层为什么要空 8 格？','帮我看看代码'],
      rules:[
        {id:'execution_count',phrases:['执行几次','多少次','18','相乘','3×6','3x6','次数']},
        {id:'outer_inner',phrases:['j 是','i 是','j是什么','i是什么','计数器','j 和 i','重新从 0','重新从0']},
        {id:'nested',phrases:['嵌套','外层','内层','大圈','小圈','循环套','几枚','几瓣']},
        {id:'indent',phrases:['8格','8 格','4格','4 格','right(120)','空几格','缩进']}
      ],
      required:[
        step('outer','外层循环',/for\s+\w+\s+in\s+range\s*\(/,'先只写外层 for j in range(3):，负责放 3 枚烟花。','先建立外层循环，确定一共放几枚烟花。'),
        step('inner','内层循环',c=>(c.match(/for\s+\w+\s+in\s+range\s*\(/g)||[]).length>=2,'外层有了，在它身体里空 4 格写内层 for i in range(6):，负责每枚 6 瓣。','还缺第二个 for；它要缩进在外层身体里，形成真正的大圈套小圈。'),
        step('actions','内层动作',c=>/\bforward\s*\(/.test(c)&&/\bright\s*\(/,'两个循环有了，内层动作空 8 格写 forward(30) 和 right(60)，内层结束后再用外层 right(120) 换方向。','还要让内层循环真正画出花瓣：forward 和 right 放在最内层，外层另留换方向动作。')
      ],
      responses:{
        nested:['外层管“放几枚”，内层管“每枚炸几瓣”。外层每进行一轮，内层都要从头完整跑完，再轮到下一枚。','像 3 个烟花筒排队：轮到 1 个筒，就连发 6 瓣；这个筒完成后，才换下一个筒。','只记分工：外层 range(3) 是枚数，内层 range(6) 是每枚瓣数。内层 for 空 4 格，内层动作空 8 格。'],
        execution_count:['外层 3 轮，每一轮内层都执行 6 次，所以最里面的动作总共是 3×6=18 次，不是 3+6=9 次。','把 18 次分成三组：第 1 枚 6 次，第 2 枚又 6 次，第 3 枚再 6 次。6+6+6，也就是 3×6。','口诀：外层每转一次，内层完整跑一遍。总次数 = 外层次数 × 内层次数。'],
        outer_inner:['j 和 i 都是计数器。j 数当前是第几枚的外层轮次，i 数当前这枚里面的瓣数；每一枚开始时，内层 i 会重新从 0 数。','像“第几组、第几个”：j 是组号，i 是组内编号。换到下一组时，组内编号重新开始。'],
        indent:['外层 for 顶格；内层 for 属于外层，所以空 4 格；forward/right 又属于内层，所以再空 4 格，一共 8 格。\n\n内层全部结束后，只空 4 格的 right(120) 用来给下一枚换方向。','把缩进想成文件夹层级：烟花总任务里有每一枚，每一枚里面又有花瓣动作。每深入一层，就多空 4 格。','记三层楼梯：0 格外层，4 格内层，8 格内层动作。不是整段都空 8 格。']
      },
      lineHints:[hint(/^for\s+\w+\s+in\s+range/,'这是外层循环，管烟花枚数。它每进行一轮，里面那套内层循环都会完整执行。'),hint(/^\s+for\s+\w+\s+in\s+range/,'这是缩进在外层里的内层循环，管每一枚的瓣数。它前面的 4 格表示“属于外层”。'),hint(/^\s{8}(forward|right)/,'这是最内层动作，两层循环都会让它重复；总执行次数是外层次数乘内层次数。'),hint(/^\s{4}right/,'这一行只属于外层：等一枚烟花的内层全部炸完，再换方向准备下一枚。')],
      chipMap:{nested:['为什么一共执行 18 次？','内层为什么要空 8 格？','还是不懂'],execution_count:['外层和内层分别管什么？','j 和 i 分别是什么？','再举个例子'],outer_inner:['为什么 i 会重新从 0 开始？','外层和内层分别管什么？'],indent:['为什么 right(120) 只空 4 格？','我改好了，帮我看看']},
      result:'这次轨迹的转弯数可以帮助检查最内层动作是否重复到位。若只看到一小组花瓣，优先检查内层 for 是否缩进在外层里、动作是否空 8 格。',
      modify:'想改成 4 枚、每枚 4 瓣，只改外层 range(3) 为 4、内层 range(6) 为 4，缩进结构不动。增加第二组颜色时，整组完成后再换 pencolor。'
    },
    22:{
      title:'直到进球',concept:'while＋if＋random',placeholder:'比如：为什么只有进球才 goals+1？',
      chips:['while 和 if 怎么合作？','为什么只有进球才加 1？','一直停不下来怎么办？','帮我看看代码'],
      rules:[
        {id:'infinite_loop',phrases:['死循环','停不下来','一直跑','停不住','不会停']},
        {id:'difference',phrases:['while 和 if','一起用','怎么合作','分工']},
        {id:'counter',phrases:['goals','计数','加1','加 1','记几球','为什么加']},
        {id:'if_goal',phrases:['if','判断','进球条件','4以上','dice','不算进球']},
        {id:'event_loop',phrases:['while','事件循环','一直','重复']},
        {id:'random',phrases:['random','骰子','随机','轮数不同']}
      ],
      required:[
        step('counter','计数盒子',/\b\w+\s*=\s*0\s*$/m,'先只写 goals = 0，表示还没进球。','先准备一个从 0 开始的计数盒子，后面才能记进球数。'),
        step('while','持续挑战',/\bwhile\s+\w+\s*</,'再写 while goals < 3:，表示没进满 3 球就继续。','还缺 while 条件循环，让程序一直挑战到目标。'),
        step('random','每轮随机',/=\s*random\s*\.\s*randint\s*\(/,'循环里空 4 格写 dice = random.randint(1,6)，每轮重新掷一次。','while 身体里要用 dice = random.randint(1,6) 保存每轮点数。'),
        step('if','进球判断',/\bif\s+\w+\s*>=\s*\d+/,'再让 if dice >= 4: 缩进在 while 里，判断本轮是否进球。','还缺 if 条件，用本轮 dice 判断 4、5、6 才算进球。'),
        step('increment','胜利才加 1',/\b\w+\s*=\s*\w+\s*\+\s*1/,'在 if 身体里空 8 格写 goals = goals + 1，只有进球才增加。','判断成立后要把 goals 加 1，否则 while 的条件永远不变。'),
        step('feedback','播报与移动',c=>/\bprint\s*\(/.test(c)&&/\bforward\s*\(/,'最后给进球分支补 print，并在 while 里补 forward，让每轮都有反馈。','再补播报和每轮移动，运行结果才能看清每轮发生了什么。')
      ],
      responses:{
        difference:['while 管“继续挑战”，if 管“这一轮算不算进球”，random 管“本轮骰子是几”。if 缩进在 while 里，所以每一轮都会重新判断一次。','像反复射门：while 让球员再射一次，random 制造这次运气，if 是裁判判定进没进，goals 负责记数。','顺序只记四步：while 开始一轮 → random 得点数 → if 判断 → 成立才 goals+1。'],
        event_loop:['while goals < 3: 表示还没进满 3 球就继续。每轮都会重新执行缩进里的随机、判断和动作，直到 goals 到 3。','它不是预先知道要射几次，而是看目标有没有达到。可能三轮就结束，也可能需要更多轮。','先找 while 条件里的盒子，再找身体里哪里让它加 1；这两处决定循环何时结束。'],
        if_goal:['if dice >= 4: 只有 dice 是 4、5、6 时才执行缩进身体。1、2、3 本轮不算进球，不会执行 goals+1。','dice 是本轮刚保存的点数，if 每轮重新读取它。判断和随机要在同一个 while 里，才会每轮更新。','if 顶格于 while 身体空 4 格，进球后的 goals+1 和 print 再空 4 格，总共 8 格。'],
        counter:['goals = goals + 1 的意思是取出旧进球数，加 1，再存回 goals。它必须缩进在 if 里，才做到“只有进球才加 1”。','如果它缩进在 while 里却和 if 对齐，那么没进球也会加 1；如果只写 goals + 1 不写 goals =，新数不会存回。','记分口诀：先取旧数，再加 1，最后存回；位置要在进球分支里。'],
        infinite_loop:['停不下来通常是 goals 没有变化。检查 goals = goals + 1 是否真的在 if 身体里，以及条件判断是否可能成立。\n\n先把循环改小做一次测试，例如目标改成 1，并 print(dice) 看每轮点数。','while 只看 goals < 3。goals 一直不变，条件就永远成立。随机点数和前进不会改变 goals，只有明确存回 goals+1 才会接近终点。','只查一行：goals = goals + 1。它要在 if dice >= 4: 里面，并且 goals 在循环前从 0 开始。'],
        random:['random.randint(1,6) 每轮给出 1～6 的点数并保存到 dice。相同点数可能连续出现，所以挑战轮数不固定。','random 只负责出点数，不负责记分；if 根据 dice 判定，goals 才负责累计。']
      },
      lineHints:[hint(/^while\s+/,'这一行检查目标是否达到。只要计数还小于目标，就会执行下面缩进的整轮动作。'),hint(/random\s*\.\s*randint/,'这一行在每一轮重新掷骰子，并把本轮点数保存到 dice。'),hint(/^if\s+/,'这一行用本轮点数判断进没进球；只有条件成立才做下面缩进的记分和播报。'),hint(/\w+\s*=\s*\w+\s*\+\s*1/,'这一行把旧计数加 1 后存回。它的位置决定是每轮都加，还是只有条件成立才加。')],
      chipMap:{difference:['为什么只有进球才加 1？','一直停不下来怎么办？','还是不懂'],event_loop:['while 和 if 怎么合作？','看看运行结果'],if_goal:['为什么 3 不算进球？','为什么只有进球才加 1？'],counter:['为什么没进球也加 1？','解释这一行','我改好了，帮我看看'],infinite_loop:['goals 应该写在哪里？','我改好了，帮我看看'],random:['为什么每次轮数不同？','while 和 if 怎么合作？']},
      result:'播报次数是成功事件反馈，不等于实际射门总轮数；如果要看每轮，可在 random 后临时 print(dice)。若一直没有进球播报，再检查 if 条件和 goals+1 的缩进。',
      modify:'想把目标改成扑出 5 球，可以把计数盒子换成 saves、while 目标改成 5，并调整 if 的成功条件和播报。随机、判断、成功才加 1 的骨架保持不变。'
    },
    23:{
      title:'战术工具箱',concept:'函数组合进阶',placeholder:'比如：定义和调用有什么不同？',
      chips:['定义和调用有什么不同？','li 参数怎么流动？','为什么要做多个工具？','帮我看看代码'],
      rules:[
        {id:'def_call',phrases:['定义和调用','定义','调用','做工具','用工具','区别','def']},
        {id:'parameter',phrases:['参数','旋钮','li','力度','括号']},
        {id:'multiple_functions',phrases:['多个函数','几个工具','工具箱','模块化','组合','为什么要做多个']},
        {id:'order',phrases:['顺序','先传','战术','调用顺序']}
      ],
      required:[
        step('defs','多个带参工具',c=>(c.match(/def\s+\w+\s*\(\s*\w+\s*\)/g)||[]).length>=2,'先做 chuan(li) 和 shemen(li) 两个工具，每个身体只写 forward(li)，先不调用。','至少需要两个带参数的 def 工具。先让每个工具只负责一个动作。'),
        step('bodies','工具身体',c=>{const defs=c.split(/\n(?=def\s+)/);return defs.length>=2&&defs.slice(0,2).every(x=>/def\s+\w+\s*\(\s*\w+\s*\):[\s\S]*?\n\s+forward\s*\(\s*\w+\s*\)/.test(x));},'工具名和旋钮有了，检查每个 def 下一行都空 4 格写 forward(li)。','工具定义之后要有缩进身体，参数要在 forward 中真正使用。'),
        step('calls','组合调用',c=>{const lines=c.split('\n').map(x=>x.trim());const defs=new Set((c.match(/def\s+(\w+)\s*\(/g)||[]).map(x=>x.replace(/^def\s+|\s*\($/g,'')));return lines.filter(x=>/^\w+\s*\(\s*\d+\s*\)/.test(x)&&!/^forward|^right|^left|^print|^pencolor/.test(x)).length>=2&&defs.size>=2;},'工具做好后，顶格写 chuan(50) 和 shemen(80)，按战术顺序调用。','还缺真正的调用：不用 def，直接写工具名并在括号里填力度数字。')
      ],
      responses:{
        def_call:['def 是“做工具”，只定义一套动作，不会因为写好就自动执行；chuan(50) 才是“用工具”，会按 50 的力度真正执行一次。','像写好菜谱和真正下厨：def 是把菜谱收进工具箱，调用才是拿出菜谱做一次菜。同一菜谱可以调用很多次。','看开头就能分清：有 def 是定义，没有 def、只有名字和括号是调用。定义先写，调用后写。'],
        parameter:['li 是力度旋钮。定义 def chuan(li): 时先给它起名字；调用 chuan(50) 时，50 暂时装进 li，身体里的 forward(li) 就前进 50。','同一个工具调用 chuan(30) 和 chuan(80)，li 分别变成 30 和 80。工具身体不用改，动作力度却不同。','记两句话：做工具，括号里写参数名；用工具，括号里填数字。'],
        multiple_functions:['每个工具只负责一个动作，chuan 管传球、tupo 管突破、shemen 管射门。组合调用就能排出不同战术，这就是模块化。','像教练有三张战术卡：每张卡单独写清楚，比赛时按需要排列。改传球只改 chuan 的定义，其他工具不受影响。','先保证两个工具各自能运行，再增加第三个；不要一开始写很长又无法定位问题。'],
        order:['调用顺序就是战术执行顺序。先写 chuan(50) 再写 shemen(80)，球员就先传后射；交换两行，配合顺序也会交换。','定义可以整齐放在前面，真正决定现场节奏的是后面一行行调用。中间也可以加入 right 改变方向。']
      },
      lineHints:[hint(/^def\s+/,'这一行是在制作一个带参数的工具，不会立即跑动。括号里写参数名，下一行缩进写工具身体。'),hint(/^\s+forward\s*\(\s*\w+\s*\)/,'这是工具身体，用参数控制距离。调用时填进的数字会暂时装进这个参数。'),hint(/^\w+\s*\(\s*\d+\s*\)/,'这是在调用已经做好的工具：括号里的数字会流进参数，工具身体按这个数字执行。')],
      chipMap:{def_call:['li 参数怎么流动？','为什么要做多个工具？','还是不懂'],parameter:['定义时为什么不写数字？','解释这一行','我改好了，帮我看看'],multiple_functions:['调用顺序有什么用？','我不知道先写什么'],order:['我想改成自己的战术','看看运行结果']},
      result:'轨迹应体现每次调用的距离和顺序。若定义很多却没有轨迹，检查是否忘了调用；若距离不对，检查调用数字是否真正通过 li 用在 forward 里。',
      modify:'想设计自己的三人配合，可以保留现有工具，只调整调用顺序和力度，再插入 right。需要新动作时才新增一个 def，不要复制整段旧工具。'
    },
    24:{
      title:'冬季银河杯闭幕式',concept:'综合项目',placeholder:'比如：闭幕式先做哪个模块？',
      chips:['大任务先做什么？','怎样先做最小版本？','嵌套循环负责什么？','帮我看看代码'],
      rules:[
        {id:'minimal',phrases:['最小版本','先完成','太多','简化','最小可行']},
        {id:'start_task',phrases:['大任务','闭幕式','综合','模块','拆解','先做什么']},
        {id:'nested',phrases:['嵌套','烟花','外层','内层']},
        {id:'for_in',phrases:['for-in','for in','名单','颁奖','列表','编号']},
        {id:'string_join',phrases:['拼接','颁奖词','字符串','数字和文字','相加']},
        {id:'random',phrases:['random','抽奖','随机']},
        {id:'input',phrases:['input','互动','观众','输入']},
        {id:'param_def',phrases:['def','参数','工具','旋钮','定义和调用']},
        {id:'while',phrases:['while','环节','控制','停不下来']}
      ],
      required:[
        step('input','观众互动',/\b\w+\s*=\s*input\s*\(/,'先做最小开场：fan = input("你喜欢闭幕式吗？") 加一句 print，运行成功后再加烟花。','先补一个会保存回答的 input，让观众互动成为作品的入口。'),
        step('for_in','获奖名单',/for\s+\w+\s+in\s+(?!range)/,'接着准备 players 名单，用 for-in 逐个播报获奖球员。','还缺列表配 for-in 的颁奖名单；先准备名单再逐项使用。'),
        step('join','颁奖词',/\+/,'名单能播报后，用 + 把当前名字和固定颁奖词拼成完整句子。','颁奖词还没拼接；名字变量不戴引号，固定祝福文字戴引号。'),
        step('nested','烟花模块',c=>(c.match(/for\s+\w+\s+in\s+range\s*\(/g)||[]).length>=2,'开场和颁奖能运行后，再加外层管枚数、内层管瓣数的烟花。','烟花需要两个 range 循环真正嵌套，外层管组数，内层管每组动作。'),
        step('def','专属带参工具',/def\s+\w+\s*\(\s*\w+\s*\)/,'再做一个 def 带参工具控制动作力度，并在后面调用一次。','还缺带参数的 def 工具；定义后别忘调用。'),
        step('random','幸运抽奖',/\brandom\s*\./,'主体稳定后，再用 random.choice 从名单抽幸运观众并播报。','还缺 random 抽奖；抽奖结果先保存，再用于颁奖播报。'),
        step('while','环节控制',/\bwhile\b/,'最后按需要加入 while 控制环节，确保计数会更新并能结束。','还缺 while 环节控制；只有确有需要时加入，并设置明确的结束条件。')
      ],
      responses:{
        minimal:['最小版本不是敷衍，而是先让核心流程能运行：一句 input、两三项名单播报、一句拼接颁奖词，再配一小段轨迹。通过后再逐个加烟花、抽奖和 while。','先做“能开幕、能颁奖、能结束”的短节目。每次只新增一个模块并运行，比一次写完所有招式更容易排错。','现在先保留最必要的三个模块：互动 → 名单 → 颁奖词。其余模块后加，不要求第一版最长。'],
        nested:['嵌套循环负责烟花：外层管放几枚，内层管每枚几瓣。内层 for 空 4 格，最内层动作空 8 格。','外层每转一次，内层完整跑一遍。枚数乘每枚瓣数，就是最内层动作总次数。','先把烟花当作独立小模块测试成功，再接回闭幕式，避免和其他模块一起排错。'],
        for_in:['for-in 负责逐个取出获奖名单。for name in players: 中，name 是本轮球员名字，不是编号。','名单有多少项，缩进里的播报就执行多少次。先创建 players，再开始点名。'],
        string_join:['颁奖词用 + 把 name 和固定祝福接起来，例如 print(name + " 获得金星奖！")。变量和固定文字分工不同。','+ 两边都应是文字：name 取出球员名，引号里的奖项保持原样。'],
        random:['random.choice(players) 可以从名单里抽幸运观众。抽到的结果要装进 lucky，再 print(lucky) 或拼进颁奖词。','抽奖前先准备候选名单。每次结果可能相同或不同，这是随机的正常表现。'],
        input:['input 用来问观众，回答必须装进变量。fan = input("你最喜欢哪个环节？") 后，后面就能用 fan 做专属互动。','input 是提问，变量是记录本，print 或拼接是使用回答。三部分别漏掉保存。'],
        param_def:['def 带参工具可以把某套动作做成可调力度的模块。定义时括号写参数名，调用时才填数字。','先定义再调用。工具做好不会自动执行，调用顺序决定它在闭幕式哪个环节出现。'],
        while:['while 适合“还没到目标就继续”的环节，例如完成 3 次庆祝。身体里必须更新条件中的计数，否则会一直循环。','如果次数已经固定，用 for 更直接；确实要看条件时才用 while，不必为了凑招式强行加入。']
      },
      lineHints:[hint(/=\s*input\s*\(/,'这是闭幕式的观众互动入口，回答会保存到等号左边的变量，后续模块可以继续使用。'),hint(/^def\s+/,'这是在制作专属工具，括号里是参数名。要在外面单独调用，工具才会在闭幕式中执行。'),hint(/random\s*\.\s*choice/,'这是从候选名单里抽幸运观众，等号左边保存本次抽中者。'),hint(/^while\s+/,'这个 while 控制一个环节持续到目标完成，身体里要有明确的计数更新。')],
      chipMap:{minimal:['大任务先做什么？','帮我看看代码','还是不懂'],nested:['内层为什么空 8 格？','看看运行结果'],for_in:['颁奖词怎么拼接？','name 是编号吗？'],string_join:['数字和文字能相加吗？','解释这一行'],random:['抽奖结果怎么保存？','看看运行结果'],input:['回答怎么放进颁奖词？','我改好了，帮我看看'],param_def:['定义和调用有什么不同？','参数怎么流动？'],while:['为什么停不下来？','大任务先做什么？']},
      result:'按节目流程核查：观众回答是否被保存，名单和颁奖词是否逐项出现，颜色与转弯是否达到作品要求。不要只看“没报错”，还要确认每个模块真的执行。',
      modify:'扩展闭幕式时先选择一个环节：加一名获奖者只改名单；加一句祝福只改拼接；加一种烟花颜色只改 pencolor。一次改一处并运行，保留已经能工作的部分。'
    }
  };
  // 作业阶段使用作业原文的新增目标，不能把模仿阶段的短答案当成完成。
  const count=(code,re)=>(String(code).match(re)||[]).length;
  const replaceStep=(list,id,next)=>list.map(s=>s.id===id?next:s);
  LEVEL_CONFIG[17].homeworkRequired=replaceStep(replaceStep(LEVEL_CONFIG[17].required,'text',
    step('text','球员与动作两个文字盒子',c=>count(c,/\b[a-zA-Z_]\w*\s*=\s*["'][^"'\n]+["']/g)>=2,'准备球员名和动作两个文字盒子，再组合解说词。','独立作业需要球员名和动作两个文字盒子。')),'print',
    step('print','三句不同解说词',c=>count(c,/\bprint\s*\(/g)>=3,'用 + 拼出三句不同的解说词并分别 print。','独立作业需要三句不同的拼接播报。'));
  LEVEL_CONFIG[18].homeworkRequired=LEVEL_CONFIG[18].required.concat([
    step('five_rounds','五轮随机点球',/for\s+\w+\s+in\s+range\s*\(\s*5\s*\)/,'把每轮掷力度、抽颜色、播报和前进装进 range(5) 循环。','独立作业需要五轮随机点球循环。')
  ]);
  LEVEL_CONFIG[20].homeworkRequired=[
    step('triangle','正三角形循环',/for\s+\w+\s+in\s+range\s*\(\s*3\s*\)/,'先用 range(3) 和 right(120) 画正三角形。','独立作业先画正三角形。'),
    step('forward','相同边长',/\bforward\s*\(/,'每个多边形内部使用相同边长。','两种图形都要有 forward 边长。'),
    step('triangle_angle','三角形转角',/\bright\s*\(\s*120\s*\)/,'三角形每边后 right(120)。','三角形转角应为 120°。'),
    step('hexagon','正六边形循环',/for\s+\w+\s+in\s+range\s*\(\s*6\s*\):[\s\S]*?right\s*\(\s*60\s*\)/,'再用 range(6) 和 right(60) 画正六边形。','还缺 range(6) 配 right(60) 的正六边形。'),
    step('colors','两种图形颜色',c=>count(c,/\bpencolor\s*\(/g)>=2,'两个多边形之前分别使用不同的 pencolor。','独立作业需要至少两种轨迹颜色。')
  ];
  LEVEL_CONFIG[21].homeworkRequired=LEVEL_CONFIG[21].required.concat([
    step('four_by_four','至少四枚四瓣',c=>{const ns=Array.from(c.matchAll(/for\s+\w+\s+in\s+range\s*\(\s*(\d+)\s*\)/g),m=>Number(m[1]));return ns.some((n,i)=>i+1<ns.length&&n>=4&&ns[i+1]>=4);},'至少一组外层和內层都不小于 4，例如 range(4) 套 range(4)。','独立作业至少需要四枚、每枚至少四瓣的一组烟花。'),
    step('colors','两组不同颜色',c=>count(c,/\bpencolor\s*\(/g)>=2,'不同烟花组之间换至少两种 pencolor。','独立作业还缺至少两种颜色。')
  ]);
  LEVEL_CONFIG[22].homeworkRequired=replaceStep(replaceStep(LEVEL_CONFIG[22].required,'while',
    step('while','扑出五球才停',/\bwhile\s+\w+\s*<\s*5/,'独立作业写 while saves < 5:，扑出五球才停。','独立作业目标是扑出五球。')),'if',
    step('if','三以上算扑出',/\bif\s+\w+\s*>=\s*3/,'每轮骰子达到 3 才算扑出。','独立作业判断条件是 dice >= 3。'));
  LEVEL_CONFIG[23].homeworkRequired=[
    step('defs','三个带参工具',c=>count(c,/def\s+\w+\s*\(\s*\w+\s*\)/g)>=3,'分别定义 chuan、tupo、shemen 三个带参工具。','独立作业需要三个带参工具。'),
    step('bodies','三个工具身体',c=>count(c,/forward\s*\(\s*\w+\s*\)/g)>=3,'每个工具都用 forward(li) 执行自己的参数。','三个工具都要使用参数控制移动。'),
    step('calls','组合调用至少四次',c=>{const defs=new Set(Array.from(c.matchAll(/def\s+(\w+)\s*\(\s*\w+\s*\)/g),m=>m[1]));const calls=Array.from(c.matchAll(/^\s*(\w+)\s*\(\s*(?:\d+|\w+)\s*\)\s*$/gm),m=>m[1]).filter(name=>defs.has(name));return calls.length>=4&&new Set(calls).size>=3;},'按自己的战术把三个工具组合调用至少四次。','三个工具都要真正调用，合计至少四次。'),
    step('turns','两次路线变向',c=>count(c,/\b(?:left|right)\s*\(/g)>=2,'在调用之间加入至少两次 left/right。','独立作业还需要至少两次转弯。')
  ];
  function cfgOf(ctx){return LEVEL_CONFIG[Number(ctx&&ctx.level)]||LEVEL_CONFIG[17];}
  function classify(question,ctx){
    const q=String(question||'').toLowerCase().replace(/\s+/g,' ').trim();ctx=ctx||{};
    if(FOLLOW.test(q)&&ctx.previousIntent&&ctx.previousIntent!=='clarify')return {intent:ctx.previousIntent,confidence:9,depth:(ctx.hintDepth||0)+1};
    const cfg=cfgOf(ctx);let best={intent:'clarify',confidence:0,depth:ctx.hintDepth||0};
    for(const rule of (cfg.rules||[]).concat(COMMON_RULES)){
      let score=0;for(const phrase of rule.phrases){if(q.includes(phrase.toLowerCase()))score+=Math.max(2,phrase.replace(/\s/g,'').length);}
      if(rule.id==='line_explain'&&ctx.selectedLine&&score)score+=5;
      if(rule.id==='error_fix'&&ctx.analysis&&ctx.analysis.error&&score)score+=4;
      if(rule.id==='modify_task'&&/改成|换成|增加|多加/.test(q)&&score)score+=8;
      if(rule.id==='angle_formula'&&score&&/为什么|多少|怎么算/.test(q)&&/360|72|角度|\d+°|\d+度/.test(q))score+=6;
      if(score>best.confidence)best={intent:rule.id,confidence:score,depth:ctx.hintDepth||0};
    }
    return best;
  }
  function out(intent,text,chips,route){return {intent,text,chips,confidence:route.confidence,depth:route.depth||0};}
  function lineOf(ctx){
    const lines=String(ctx.code||'').split('\n');let n=ctx.lineNumber||0;
    if(!n||!lines[n-1]||!lines[n-1].trim())n=lines.findIndex(s=>s.trim())+1;
    if(ctx.selectedLine){
      const selected=String(ctx.selectedLine).split('\n')[0],codeLine=n>0?lines[n-1]||'':'';
      const raw=codeLine&&codeLine.trim()===selected.trim()?codeLine:selected;
      return {n,text:raw.trim(),raw};
    }
    const raw=n>0?lines[n-1]||'':'';
    return {n,text:raw.trim(),raw};
  }
  function errorAnswer(ctx,route,intent){
    const a=ctx.analysis;
    if(!a||!a.error)return out(intent||'error_fix','我刚重新检查了当前编辑器里的代码，没有发现语法错误。接下来点一次「▶运行」，再对照本关任务看播报和轨迹。\n\n如果你问的是运行结果，我可以按这次真实记录继续分析。',['看看运行结果','解释这一行','帮我看看代码'],route);
    const e=a.error,n=e.line||ctx.lineNumber||1,lines=String(ctx.code||'').split('\n'),line=(lines[n-1]||'').trim();
    const kind=String(e.errKind||'').split(':')[0],word=e.errWord||'';
    let reason='这一行的结构还没有写完整。',action='只修改这一处，再重新运行观察。';
    const table={
      'for体空':['for 后面的动作没有缩进，电脑不知道哪些事要重复。','把循环身体的每一行前面空 4 格；如果身体又在内层，就按所在层级增加缩进。'],
      'for写法of':['Python 的列表点名使用 in，不使用其他语言里的 of。','把 of 改成 in，并保留结尾冒号。'],
      'for写法':['for 开头这句缺少循环结构的一部分。','检查 for、计数名字、in、range(次数) 或列表名、结尾冒号。'],
      'forin非列表':['in 后面需要一张列表，但这里取到的不是列表。','先在使用前创建列表，再把列表名放到 in 后面。'],
      'while体空':['while 的身体没有正确缩进，重复动作没有装进去。','把每轮要做的事放到 while 下一行，并空 4 格。'],
      '死循环':['while 的条件一直成立，条件里的计数没有有效更新。','检查计数是否先装初始值，并在正确分支里写“计数 = 计数 + 1”；临时 print 计数观察。'],
      'if写法':['if 后面需要能判断真假的条件；一个 = 是装东西，== 才是比较相等。','补全比较对象、比较符号和冒号，例如 if dice >= 4:。'],
      'else配对':['else 找不到与它配对的 if，或两者缩进没有对齐。','让 else 紧跟在 if 结构后，并与 if 对齐。'],
      'else写法':['else 需要独占一行，结尾只写冒号。','写成 else:，下一行再缩进写不满足条件时要做的事。'],
      'def函数体空':['工具 '+word+' 的身体没有正确缩进。','在 def 下一行空 4 格写动作，参数也要在身体中真正使用。'],
      'def写法大写':['def 三个字母必须全小写。','把行首改成小写 def。'],
      'def写法中文名':['当前工具名需要使用英文或拼音。','换一个英文或拼音工具名，定义和调用处保持一致。'],
      'def写法同行身体':['工具身体和 def 挤在同一行。','冒号后回车，另起一行空 4 格写动作。'],
      'def写法数字旋钮':['定义工具时括号里写参数名，不是具体数字。','把数字换成 li 等参数名；数字留到调用时再填。'],
      'def写法多旋钮':['当前课程的解释器每个工具支持一个参数。','先保留一个最需要的参数，把其他动作拆到另一个工具。'],
      'def写法':['def 的工具定义结构不完整。','检查小写 def、英文工具名、一对括号和结尾冒号。'],
      '调用误写def':['工具 '+word+' 已经定义过了，这里更像是要使用它。','调用时去掉 def，直接写工具名和括号；带参工具还要填数字。'],
      '调用未定义工具':['工具 '+word+' 在调用前还没有定义，或两处拼写不同。','检查拼写，并确保 def 定义在调用之前。'],
      '调用少旋钮':['工具 '+word+' 定义了参数，调用时却没有给它数字。','在括号里填一个力度数字，例如 '+word+'(50)。'],
      '旋钮非数字':['这个工具的参数用于控制数字力度，但收到的是文字。','把调用括号里的内容改成数字，例如 '+word+'(50)。'],
      '无旋钮给参数':['工具 '+word+' 定义时没有参数，调用却多给了内容。','如果不需要参数，改成 '+word+'()；如果确实需要力度，先在定义括号里加参数名。'],
      'input裸写':['input 问到的回答没有装进变量，后面无法使用。','左边补一个变量和等号，例如 fan = input("你的问题")。'],
      'random写法':['随机口令写法不完整，或结果没有保存。','使用 dice = random.randint(1,6) 或 c = random.choice(colors)，注意 random. 和 =。'],
      'choice非列表':['choice 需要从列表抽签，但括号里不是列表。','先创建候选列表，再写 random.choice(列表名)。'],
      '空盒子':['这里用到了「'+word+'」，但它在之前还没有装进内容。','把变量或列表的创建移动到这次使用之前。'],
      '文字没引号':['这里要表达的是文字，但固定文字没有英文引号。','给原样文字戴上英文引号；变量名不要加引号。'],
      '裸中文文字':['中文内容不能直接当指令或变量使用。','要播报就放进带引号的 print；要动作就换成本关英文指令。'],
      '数字文字混加':['+ 的一边是数字、另一边是文字，电脑无法选择相加还是拼接。','本关先分开播报，或把要表达的内容统一成一段带引号文字。'],
      'print写法':['print 括号里的内容还没有写清楚。','播报变量写 print(name)，播报固定文字写 print("你好")。'],
      '漏括号':['指令和数字之间缺少括号。','改成 '+word+'(数字) 的形式。'],
      '拼写错误':['指令或工具名「'+word+'」可能有拼写错误。','对照本关积木逐字母检查，定义和调用也要一致。']
    };
    if(table[kind]){reason=table[kind][0];action=table[kind][1];}
    return out(intent||'error_fix','我看到的是第 '+n+' 行：\n`'+line+'`\n\n问题在这里：'+reason+'\n\n你现在只做一步：'+action,['解释这一行','我改好了，帮我看看','还是不懂'],route);
  }
  function moduleStates(code,cfg,isHomework){const required=isHomework&&cfg.homeworkRequired||cfg.required;return required.map(m=>({...m,ok:typeof m.test==='function'?m.test(code):m.test.test(code)}));}
  function review(ctx,cfg,route){
    const code=String(ctx.code||'');
    if(!code.trim())return out('review_code','现在编辑器还是空的。'+(ctx.isHomework&&cfg.homeworkRequired||cfg.required)[0].next,['第一步怎么写',cfg.chips[0]],route);
    if(ctx.analysis&&ctx.analysis.error)return errorAnswer(ctx,route,'review_code');
    const states=moduleStates(code,cfg,ctx.isHomework),missing=states.filter(x=>!x.ok),done=states.filter(x=>x.ok);
    if(missing.length){
      const prefix=done.length?'你已经完成了：'+done.map(x=>x.label).join('、')+'。':'代码现在能读通，但本关核心结构还没齐。';
      return out('review_code',prefix+'\n\n现在只处理下一块「'+missing[0].label+'」：'+missing[0].review,['我改好了，帮我看看','还是不懂',cfg.chips[0]],route);
    }
    return out('review_code','这次代码能读通，而且本关要求的模块都出现了：'+states.map(x=>x.label).join('、')+'。\n\n接下来点「▶运行」，不要只看“没报错”，还要核对'+cfg.result,['看看运行结果','我想修改作品','解释这一行'],route);
  }
  function startTask(ctx,cfg,route,depth){
    const code=String(ctx.code||''),states=moduleStates(code,cfg,ctx.isHomework),next=states.find(x=>!x.ok)||null;
    let text;
    if(!code.trim())text=(ctx.isHomework&&cfg.homeworkRequired||cfg.required)[0].next;
    else if(next){const done=states.filter(x=>x.ok);text=(done.length?'你已经有了'+done.map(x=>x.label).join('、')+'。':'你已经开始写了。')+'\n\n现在只做下一块「'+next.label+'」：'+next.next;}
    else text='主要模块已经齐了。现在先运行一次，按真实播报和轨迹验收，不要继续无目的地加代码。';
    if(depth>0)text+='\n\n先不要改其他地方，只完成上面这一小块；完成后再点“我改好了，帮我看看”。';
    return out('start_task',text,['我改好了，帮我看看',cfg.chips[0],'还是不懂'],route);
  }
  function lineAnswer(ctx,cfg,route){
    const at=lineOf(ctx),line=at.text;let detail='';
    for(const h of cfg.lineHints||[]){if(h.re.test(at.raw||line)){detail=h.text;break;}}
    if(!detail){
      if(/^for\s+\w+\s+in\s+range/.test(line))detail='这是按固定次数重复的循环。range 里的数字决定执行几轮，下面缩进的事每轮都会做。';
      else if(/^for\s+\w+\s+in\s+/.test(line))detail='这是列表点名。for 后面的名字是本轮拿到的内容本身，in 后面是整张列表。';
      else if(/^while\s+/.test(line))detail='这是条件循环。条件成立就做下面缩进的事；身体必须让条件逐步接近不成立，才能停止。';
      else if(/^def\s+/.test(line))detail='这是在定义工具，不会自动执行。后面还要用工具名加括号调用。';
      else if(/^if\s+/.test(line))detail='这是在判断条件。条件成立才执行下面缩进的身体。';
      else if(/^else/.test(line))detail='else 接住 if 条件不成立的情况，要与 if 对齐，身体再缩进。';
      else if(/=\s*input\s*\(/.test(line))detail='这一行把 input 收到的回答保存进变量，后面才能继续使用。';
      else if(/random\s*\./.test(line))detail='这一行产生并保存一次随机结果，后面使用同一个变量就能用到本次结果。';
      else if(/=\s*\[/.test(line))detail='这是在创建列表，方括号装候选项，逗号分开，后面可以逐项取出或抽签。';
      else if(/\w+\s*=\s*\w+\s*\+\s*1/.test(line))detail='这是把旧计数加 1 后存回盒子。它所在的缩进层级决定什么时候更新。';
      else if(/=\s*["']/.test(line))detail='这是把文字装进变量盒子，固定文字要戴英文引号。';
      else if(/\+/.test(line))detail='这里的 + 把文字片段接起来。变量取出内容，带引号的固定文字保持原样。';
      else if(/^print/.test(line))detail='print 负责播报。变量名不戴引号才会播出盒子内容，固定文字需要引号。';
      else if(/^pencolor/.test(line))detail='这是设置画笔颜色。使用变量时，变量里必须已经装着可用颜色。';
      else if(/^forward/.test(line))detail='这是前进一步。它所在的缩进层级决定执行一次还是每轮执行。';
      else if(/^right/.test(line))detail='这是向右转角度。画正多边形时，每次转角通常是 360÷边数。';
      else detail='这一行要结合它上面和下面的结构看。你可以继续问“它在这一关负责什么”，我会按本关任务解释。';
    }
    return out('line_explain','先看第 '+at.n+' 行：`'+line+'`。\n\n'+detail,['再简单一点','帮我看看代码','看看运行结果'],route);
  }
  function resultAnswer(ctx,cfg,route){
    const run=ctx.run||{},prints=run.prints||[],colors=run.colors||[],inputs=run.inputs||[],turns=Number(run.turns||0),obs=[];
    if(prints.length)obs.push('播报 '+prints.length+' 句：'+prints.slice(0,6).map((x,i)=>(i+1)+'. '+x).join('；')+(prints.length>6?'；……':''));
    if(colors.length)obs.push('轨迹使用 '+new Set(colors).size+' 种颜色：'+Array.from(new Set(colors)).join('、'));
    if(turns)obs.push('轨迹中有 '+turns+' 次转弯');
    if(inputs.length)obs.push('保存了 '+inputs.length+' 次互动回答：'+inputs.slice(0,3).map(x=>x.a).join('、'));
    if(!obs.length)return out('result_analysis','我还没有看到这次运行的播报、轨迹或互动记录。先点一次「▶运行」，运行完再问，我就能按真实结果分析。',['帮我看看代码','解释这一行'],route);
    return out('result_analysis','我按这次真实运行记录看：\n'+obs.map(x=>'· '+x).join('\n')+'\n\n'+cfg.result,['我想修改作品','帮我看看代码','解释这一行'],route);
  }
  function baseAnswer(question,ctx){
    ctx=ctx||{};const cfg=cfgOf(ctx),route=classify(question,ctx),intent=route.intent,depth=route.depth||0;
    if(intent==='error_fix')return errorAnswer(ctx,route);
    if(intent==='review_code')return review(ctx,cfg,route);
    if(intent==='start_task')return startTask(ctx,cfg,route,depth);
    if(intent==='line_explain')return lineAnswer(ctx,cfg,route);
    if(intent==='result_analysis')return resultAnswer(ctx,cfg,route);
    if(intent==='modify_task')return out(intent,cfg.modify,['我改好了，帮我看看','看看运行结果','还是不懂'],route);
    const variants=cfg.responses&&cfg.responses[intent];
    if(variants&&variants.length)return out(intent,variants[Math.min(depth,variants.length-1)],(cfg.chipMap&&cfg.chipMap[intent])||['还是不懂','帮我看看代码','我不知道先写什么'],route);
    if(intent==='indent')return out(intent,'缩进表示“这件事属于上面的结构”。每进入一层空 4 格：循环或工具身体空 4 格，嵌套在最里面的动作再空 4 格。',['解释这一行','我改好了，帮我看看','还是不懂'],route);
    if(intent==='print')return out(intent,'print 负责播报。print(name) 播出变量盒子里的内容；print("你好") 播出固定文字。变量名戴了引号，就只会念出名字本身。',['为什么要加引号？','看看运行结果','解释这一行'],route);
    return out('clarify','我想回答得更准一点。你现在卡在哪一种情况？可以选一个，也可以把光标放在不懂的代码行，再问“这一行什么意思”。',cfg.chips.slice(0,3),route);
  }
  function answer(question,ctx){
    ctx=ctx||{};const result=baseAnswer(question,ctx),q=String(question||'');
    if(!FOLLOW.test(q)||ctx.previousIntent!==result.intent)return result;
    let tip='';const line=String(ctx.selectedLine||'').trim();
    if(result.intent==='review_code'){
      if(ctx.analysis&&ctx.analysis.error)tip='先别检查整段，只处理报错指出的第 '+(ctx.analysis.error.line||ctx.lineNumber||1)+' 行。其他行暂时不改，改完这一行再让我看。';
      else{const cfg=cfgOf(ctx),next=moduleStates(String(ctx.code||''),cfg,ctx.isHomework).find(x=>!x.ok);tip=next?'我们把检查缩到最小：现在只找「'+next.label+'」。'+next.next:'先做一个小实验：点一次「▶运行」，只核对一项播报或轨迹，不要求一次检查全部。';}
    }else if(result.intent==='error_fix')tip='先暂停理解整个错误。只找到第 '+((ctx.analysis&&ctx.analysis.error&&ctx.analysis.error.line)||ctx.lineNumber||1)+' 行，按上面的动作改一处，其他代码暂时不动。';
    else if(result.intent==='line_explain')tip='先只读这一句口令'+(line?'：“'+line+'”':'')+'，不用同时理解上下文。你可以再问“它负责什么”，我们只讲它的一个作用。';
    else if(result.intent==='result_analysis'){
      const run=ctx.run||{},first=(run.prints&&run.prints[0])||(run.colors&&run.colors[0])||(run.inputs&&run.inputs[0]&&run.inputs[0].a);
      tip=first?'先只核对第一项真实结果：“'+first+'”。确认这一项是否符合预期，再看下一项，不用一次分析全部。':'现在还没有运行记录。先只做一个动作：点「▶运行」；完成后再来问我。';
    }else if(result.intent==='modify_task')tip='把扩展缩到最小：只改一个名字、一个数字或一句播报，改完马上运行。确认这处能用，再做下一个改动。';
    else if(result.intent==='indent')tip='把缩进想成三层楼梯：最外层 0 格，里面一层 4 格，再里面一层 8 格。现在只检查光标这一行站在哪一层。';
    else if(result.intent==='print')tip='只记一个例子：print(name) 是播出盒子里的内容，print("name") 是原样念出 name。先看你自己的括号里有没有引号。';
    else{const cfg=cfgOf(ctx),variants=cfg.responses&&cfg.responses[result.intent];if(result.depth>0&&(!variants||result.depth>=variants.length))tip='先暂停记新知识。把光标放在最不懂的一行，问“这一行什么意思”，我们只解决这一行。';}
    if(tip)result.text+='\n\n'+tip;return result;
  }
  const api={classify,answer,LEVEL_CONFIG,INTENT_NAMES,RULES:COMMON_RULES};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.Coach18_25=api;
})(typeof window!=='undefined'?window:globalThis);
