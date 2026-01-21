let agents = [];
let buildMode = null; // 当前选中的建造类型

// 初始化建造菜单
function initUI() {
    const menu = document.getElementById('buildMenu');
    for (let key in CONFIG.buildings) {
        let b = CONFIG.buildings[key];
        let btn = document.createElement('div');
        btn.className = 'build-btn';
        btn.innerHTML = `<b>${b.name}</b><span>$${b.cost}</span>`;
        btn.onclick = () => {
            buildMode = key;
            document.querySelectorAll('.build-btn').forEach(d=>d.classList.remove('active'));
            btn.classList.add('active');
        };
        menu.appendChild(btn);
    }
    
    // 扩建按钮
    document.getElementById('btnExpand').onclick = () => MapSystem.expand();
}

// 鼠标点击建造
canvas.addEventListener('mousedown', (e) => {
    if (!buildMode) return;
    
    const rect = canvas.getBoundingClientRect();
    // 换算网格坐标 (减去偏移量)
    let c = Math.floor((e.clientX - rect.left - STATE.offsetX) / CONFIG.tileSize);
    let r = Math.floor((e.clientY - rect.top - STATE.offsetY) / CONFIG.tileSize);

    // 越界检查
    if (r < 0 || r >= STATE.rows || c < 0 || c >= STATE.cols) return;
    
    // 检查占用
    if (MapSystem.grid[r][c] !== 0) {
        Logger.add('sys', '这里已经有东西了！');
        return;
    }

    // 扣钱
    let cost = CONFIG.buildings[buildMode].cost;
    if (STATE.money < cost) {
        Logger.add('sys', '资金不足！');
        return;
    }

    STATE.money -= cost;
    MapSystem.build(r, c, buildMode);
});

// 主循环
function loop() {
    ctx.clearRect(0,0,canvas.width, canvas.height); // 刷黑
    
    // 1. 逻辑更新
    STATE.day += CONFIG.speed * 0.1;
    if (STATE.day > 365) { STATE.year++; STATE.day = 0; }
    
    // 自动生成流民 (每隔一段时间来一个人)
    if (Math.random() < 0.01 * CONFIG.speed && agents.length < 50) {
        agents.push(new Agent());
    }

    // Agent 更新
    agents.forEach(a => a.update());

    // 2. 渲染
    MapSystem.draw(ctx);
    agents.forEach(a => a.draw(ctx));

    // 3. UI 更新
    document.getElementById('timeDisplay').innerText = `第 ${STATE.year} 年`;
    document.getElementById('moneyDisplay').innerText = Math.floor(STATE.money);
    document.getElementById('popDisplay').innerText = agents.length;
    let workers = agents.filter(a => a.job).length;
    document.getElementById('jobDisplay').innerText = `就业: ${workers}/${agents.length}`;

    requestAnimationFrame(loop);
}

// 启动
window.onload = () => {
    initUI();
    MapSystem.init();
    loop();
};

// 滑块
document.getElementById('speedSlider').oninput = function() { CONFIG.speed = parseInt(this.value); };