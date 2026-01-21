// === 1. 全局配置 ===
const CONFIG = {
    tileSize: 48, 
    speed: 1,
    initialMoney: 50000,
    
    // 建筑数据
    buildings: {
        'road': { name: '道路', cost: 100, color: '#555', type: 'road' },
        'house_s': { name: '木屋', cost: 2000, color: '#e6b8a2', type: 'house', capacity: 2 },
        'house_l': { name: '公寓', cost: 8000, color: '#d4a373', type: 'house', capacity: 8 },
        'company': { name: '工厂', cost: 5000, color: '#4a90e2', type: 'company', jobs: 4, salary: 200 },
        'office':  { name: '写字楼', cost: 15000, color: '#50e3c2', type: 'company', jobs: 10, salary: 500 }
    },
    
    expansionCost: {
        5: 10000,
        7: 50000,
        9: 200000,
        11: 500000
    }
};

// === 2. 核心全局对象 (修复报错的关键！) ===
// 放在这里，保证所有其他脚本都能访问到 canvas 和 ctx
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 强制设置画布大小 (稍微大一点防止越界)
canvas.width = 800;
canvas.height = 600;

// === 3. 游戏运行时状态 ===
const STATE = {
    money: CONFIG.initialMoney,
    rows: 5,  
    cols: 5,
    offsetX: 0,
    offsetY: 0,
    year: 1,
    day: 0
};

// === 4. 美术资源 ===
const ASSETS = {
    man: new Image(), woman: new Image(),
    ground: new Image(), road: new Image(),
    house: new Image(), company: new Image()
};

// 确保你 assets 文件夹里有这些图，没有的话代码会自动用色块兜底
ASSETS.man.src = 'assets/man.png'; 
ASSETS.woman.src = 'assets/woman.png';
ASSETS.ground.src = 'assets/ground.png'; 
ASSETS.road.src = 'assets/road.png';
ASSETS.house.src = 'assets/house.png'; 
ASSETS.company.src = 'assets/company.png';