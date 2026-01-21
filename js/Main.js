let agents = [];
let gameLoopId;
let isPaused = false; // 必须有这一行
let currentBuildType = null; // 当前选中的建造类型


function setBuildMode(type) {
    currentBuildType = type;
    document.body.style.cursor = 'crosshair'; // 鼠标变十字
}

// 监听画布点击
canvas.addEventListener('mousedown', (e) => {
    if (!currentBuildType) return;

    // 计算点击了哪个格子
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const c = Math.floor(x / CONFIG.tileSize);
    const r = Math.floor(y / CONFIG.tileSize);

    // 检查是否越界或已有建筑
    if (r >= 0 && r < CONFIG.rows && c >= 0 && c < CONFIG.cols) {
        if (MapSystem.grid[r][c] !== 0) {
            alert("这里不能造！只能造在草地上。");
            return;
        }
        
        // 检查钱够不够
        let cost = ECONOMY.buildCost[currentBuildType];
        if (ECONOMY.treasury < cost) {
            alert("财政赤字！没钱造了！");
            return;
        }

        // 扣钱
        ECONOMY.treasury -= cost;
        document.getElementById('treasuryDisplay').innerText = `财政: ${Math.floor(ECONOMY.treasury)}`;

        // 生成建筑
        let b = null;
        if (currentBuildType === 'school') b = new School(r, c, 'primary');
        else b = new Building(r, c, currentBuildType);
        
        MapSystem.buildings.push(b);
        MapSystem.grid[r][c] = 2; // 标记占用
        
        // 刷新画面
        MapSystem.draw(ctx); 
    }
});

// 右键取消建造模式
canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    currentBuildType = null;
    document.body.style.cursor = 'default';
});
// 建造模式
let buildType = null;

function setBuild(type) {
    buildType = type;
    // 改变鼠标样式
}

canvas.addEventListener('mousedown', (e) => {
    if (!buildType) return;

    const rect = canvas.getBoundingClientRect();
    // 逆向计算点击了哪个格子 (减去偏移量)
    const x = e.clientX - rect.left - STATE.offsetX;
    const y = e.clientY - rect.top - STATE.offsetY;
    
    const c = Math.floor(x / CONFIG.tileSize);
    const r = Math.floor(y / CONFIG.tileSize);

    // 越界检查
    if (r < 0 || r >= STATE.rows || c < 0 || c >= STATE.cols) return;
    
    // 检查是否已占用
    if (MapSystem.grid[r][c] !== 0) return;

    // 扣钱
    let cost = CONFIG.buildings[buildType].cost;
    if (STATE.money >= cost) {
        STATE.money -= cost;
        MapSystem.build(r, c, buildType);
        updateUI();
    } else {
        alert("资金不足！");
    }
});

// 扩容按钮逻辑
function tryExpand() {
    let nextSize = STATE.rows + 2; // 下一级
    let req = CONFIG.expansion[nextSize]; // 查配置表
    
    if (!req) { alert("已达最大规模！"); return; }
    
    if (agents.length >= req.popReq && STATE.money >= req.cost) {
        STATE.money -= req.cost;
        MapSystem.expand();
        updateUI();
    } else {
        alert(`扩容条件不足！\n需要人口: ${req.popReq}\n需要资金: ${req.cost}`);
    }
}
function initGame() {
    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    
    // 重置数据
    TimeSystem.year = CONFIG.startYear;
    TimeSystem.month = 1;
    TimeSystem.day = 1;
    Logger.clear();
    
    MapSystem.init();
    
    agents = [];
    for (let i = 0; i < CONFIG.initialPeople; i++) {
        agents.push(new Agent());
    }
    
    gameLoop();
}

function gameLoop() {
    if (isPaused) {
        gameLoopId = requestAnimationFrame(gameLoop);
        return;
    }

    // 逻辑循环 (受速度控制)
    for (let s = 0; s < CONFIG.speed; s++) {
        TimeSystem.tick();
        
        let newBabies = [];
        agents = agents.filter(a => !a.dead);

        // 碰撞检测与匹配 (O(N^2) 简化版)
        for (let i = 0; i < agents.length; i++) {
            let a = agents[i];
            a.update();
            
            // 尝试生娃
            let baby = a.tryReproduce();
            if (baby) newBabies.push(baby);

            // 匹配逻辑
            if (a.age >= 22 && a.status === 0 && a.state.includes('TO_')) {
                for (let j = i + 1; j < agents.length; j++) {
                    let b = agents[j];
                    if (b.status === 0 && b.gender !== a.gender && b.age >= 22 && b.state.includes('TO_')) {
                        let dist = Math.hypot(a.x - b.x, a.y - b.y);
                        if (dist < 15) {
                            // 结婚！
                            a.status = 1; b.status = 1;
                            a.partner = b; b.partner = a;
                            Logger.add('marry', `${a.name} 与 ${b.name} 牵手成功`);
                        }
                    }
                }
            }
        }
        agents.push(...newBabies);
    }

    // 渲染循环 (每帧一次)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    MapSystem.draw(ctx);
    for (let a of agents) a.draw(ctx);
    
    // UI更新
    document.getElementById('timeDisplay').innerText = TimeSystem.getDateStr();
    document.getElementById('popDisplay').innerText = agents.length;

    gameLoopId = requestAnimationFrame(gameLoop);
}

// 事件绑定
document.getElementById('btnReset').onclick = initGame;
document.getElementById('btnPause').onclick = () => isPaused = !isPaused;
document.getElementById('speedSlider').oninput = function() {
    CONFIG.speed = parseInt(this.value);
    document.getElementById('speedVal').innerText = this.value + 'x';
};

// 启动
window.onload = initGame;