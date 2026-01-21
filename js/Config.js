const CONFIG = {
    // 基础设置
    tileSize: 48, // 格子大一点，方便点击
    speed: 1,     // 默认慢速
    
    // 游戏进程
    initialRows: 5,
    initialCols: 5,
    initialMoney: 50000, // 启动资金
    
    // 扩容规则
    expansion: {
        5: { popReq: 10, cost: 10000 }, // 5x5 -> 7x7 需要 10人口
        7: { popReq: 30, cost: 50000 },
        9: { popReq: 60, cost: 100000 },
        11: { popReq: 100, cost: 200000 }
    },

    // 建筑参数表
    buildings: {
        'road': { cost: 100, name: '道路', color: '#555' },
        'house_s': { cost: 2000, name: '木屋', capacity: 2, rent: 200, color: '#e8a87c' },
        'house_l': { cost: 8000, name: '公寓', capacity: 10, rent: 800, color: '#c38d9e' },
        'company_s': { cost: 5000, name: '小作坊', jobs: 4, salary: 3000, color: '#85dcb' },
        'company_l': { cost: 20000, name: '写字楼', jobs: 20, salary: 8000, color: '#41b3a3' },
        'school': { cost: 15000, name: '学校', capacity: 50, tuition: 500, color: '#e27d60' }
    }
};

// 全局游戏状态
const STATE = {
    money: CONFIG.initialMoney,
    rows: CONFIG.initialRows,
    cols: CONFIG.initialCols,
    population: 0,
    offsetX: 0, // 地图绘制的偏移量(居中用)
    offsetY: 0
};

// === 核心：初始化 Canvas 并挂载到全局 ===
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 强制对齐大小
canvas.width = CONFIG.cols * CONFIG.tileSize;
canvas.height = CONFIG.rows * CONFIG.tileSize;

// 导出给其他模块用 (如果是 ES6 模块可以用 export，但在 HTML 直接引用模式下，const 就是全局的)
// 为了保险，确保不要在其他文件里重复声明 const ctx

const ASSETS = {
    man: new Image(), woman: new Image(), baby: new Image(), heart: new Image(),
    ground: new Image(), road: new Image(), 
    house: new Image(), company: new Image(), school: new Image()
};

// 资源路径 (确保 assets 文件夹在根目录)
ASSETS.man.src = 'assets/man.png';
ASSETS.woman.src = 'assets/woman.png';
ASSETS.baby.src = 'assets/baby.png';
ASSETS.ground.src = 'assets/ground.png';
ASSETS.road.src = 'assets/road.png';
ASSETS.house.src = 'assets/house.png';
ASSETS.company.src = 'assets/company.png';
ASSETS.school.src = 'assets/school.png';
ASSETS.heart.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAABmJLR0QA/wD/AP+gvaeTAAAAKUlEQVQYlWNgwA7+4xP/x6f4P5iSEBTEp3GYAAiToBibxv//4wO45wgAAPWADVE8M2OIAAAAAElFTkSuQmCC';

const ECONOMY = {
    treasury: 100000, // 政府初始资金
    taxRate: 0.1,     // 税率
    
    // 建筑造价
    buildCost: {
        house: 5000,
        company: 10000,
        school: 20000
    },
    
    // 房地产参数
    housePrice: 200000, // 初始房价
    rentPrice: 1500     // 初始房租
};