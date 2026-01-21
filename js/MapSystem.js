const MapSystem = {
    grid: [],      // 存储地块类型 ID
    buildings: [], // 存储建筑对象

    init() {
        this.grid = [];
        this.buildings = [];
        
        // 1. 初始化 5x5 草地
        for (let r = 0; r < STATE.rows; r++) {
            this.grid.push(new Array(STATE.cols).fill(0)); // 0=草地
        }

        // 2. 开局赠送：2住宅 1公司 连条路
        // 中心点
        let mr = Math.floor(STATE.rows/2); 
        let mc = Math.floor(STATE.cols/2);
        
        this.build(mr, mc, 'road'); // 中间路
        this.build(mr, mc-1, 'house_s'); // 左边房
        this.build(mr, mc+1, 'house_s'); // 右边房
        this.build(mr-1, mc, 'company_s'); // 上面公司
        
        // 生成初始 Agent (2个)
        spawnAgent(mr, mc-1);
        spawnAgent(mr, mc+1);
        
        this.updateOffset();
    },

    // 计算居中偏移量
    updateOffset() {
        STATE.offsetX = (canvas.width - STATE.cols * CONFIG.tileSize) / 2;
        STATE.offsetY = (canvas.height - STATE.rows * CONFIG.tileSize) / 2;
    },

    // 地图扩容 (核心算法)
    expand() {
        // 每次上下左右各加一圈 (+2)
        let oldRows = STATE.rows;
        let oldCols = STATE.cols;
        
        STATE.rows += 2;
        STATE.cols += 2;

        // 1. 调整 grid 数组
        // 新增头部行
        this.grid.unshift(new Array(STATE.cols).fill(0));
        // 新增尾部行
        this.grid.push(new Array(STATE.cols).fill(0));
        
        // 中间每一行，左右各加一个 0
        for (let r = 1; r < STATE.rows - 1; r++) {
            this.grid[r].unshift(0);
            this.grid[r].push(0);
        }

        // 2. 调整所有已有建筑的坐标 (因为原点变了)
        // 都在 (r+1, c+1) 的位置
        this.buildings.forEach(b => {
            b.r += 1;
            b.c += 1;
            b.updatePos(); // 更新像素坐标
        });

        // 3. 调整所有人的坐标
        agents.forEach(a => {
            a.x += CONFIG.tileSize;
            a.y += CONFIG.tileSize;
        });

        this.updateOffset();
        Logger.add('sys', `城市扩张！当前规模: ${STATE.rows}x${STATE.cols}`);
    },

    // 建造
    build(r, c, type) {
        // 扣钱逻辑在 Main.js 处理，这里只负责生成数据
        this.grid[r][c] = 1; // 标记非草地
        
        let b = new Building(r, c, type);
        this.buildings.push(b);
        return b;
    },

    draw(ctx) {
        // 绘制背景区域 (深色底)
        ctx.fillStyle = '#111';
        ctx.fillRect(0,0,canvas.width, canvas.height);

        // 绘制地图区域 (亮色底)
        ctx.fillStyle = '#2d2d2d'; // 泥土色
        ctx.fillRect(STATE.offsetX, STATE.offsetY, STATE.cols*CONFIG.tileSize, STATE.rows*CONFIG.tileSize);

        // 绘制网格线 (方便看)
        ctx.strokeStyle = '#444';
        ctx.beginPath();
        for(let r=0; r<=STATE.rows; r++) {
            ctx.moveTo(STATE.offsetX, STATE.offsetY + r*CONFIG.tileSize);
            ctx.lineTo(STATE.offsetX + STATE.cols*CONFIG.tileSize, STATE.offsetY + r*CONFIG.tileSize);
        }
        for(let c=0; c<=STATE.cols; c++) {
            ctx.moveTo(STATE.offsetX + c*CONFIG.tileSize, STATE.offsetY);
            ctx.lineTo(STATE.offsetX + c*CONFIG.tileSize, STATE.offsetY + STATE.rows*CONFIG.tileSize);
        }
        ctx.stroke();

        // 绘制建筑
        for (let b of this.buildings) b.draw(ctx);
    }
};