class Agent {
    // 让构造函数同时接收 坐标 和 父姓
    constructor(r, c, fatherName = null) {
        // 1. 计算坐标 (基于地图偏移量)
        this.r = r; 
        this.c = c;
        // 注意：这里需要引用全局的 STATE 和 CONFIG，确保它们已加载
        this.x = (window.STATE ? STATE.offsetX : 0) + c * CONFIG.tileSize + CONFIG.tileSize/2;
        this.y = (window.STATE ? STATE.offsetY : 0) + r * CONFIG.tileSize + CONFIG.tileSize/2;

        this.target = null;
        
        // 2. 属性初始化
        this.gender = Math.random() > 0.5 ? 'male' : 'female';
        
        // 这里就是报错的地方，现在 fatherName 有定义了
        this.name = NameGenerator.gen(this.gender, fatherName ? fatherName[0] : null);
        
        // 如果有父亲，说明是新生儿(0岁)；否则是初始移民(18-30岁)
        this.age = fatherName ? 0 : 18 + Math.random() * 12;
        
        this.wealth = fatherName ? 0 : 500; // 初始资金
        this.job = null;
        this.home = null;
        this.state = 'IDLE';
        this.dead = false;
    }

    // 找工作逻辑
    findJob() {
        if (this.job) return;
        
        // 遍历所有公司，找工资高且没满的
        let bestCompany = null;
        let maxSalary = -1;

        for (let b of MapSystem.buildings) {
            if (b.data.jobs && b.workers.length < b.data.jobs) {
                if (b.data.salary > maxSalary) {
                    maxSalary = b.data.salary;
                    bestCompany = b;
                }
            }
        }

        if (bestCompany) {
            this.job = bestCompany;
            bestCompany.workers.push(this);
            Logger.add('work', `${this.name} 入职了 ${bestCompany.data.name} (薪资:${maxSalary})`);
        }
    }
    
    // ... 移动和绘制逻辑需要加上 STATE.offsetX 的偏移量计算 ...
}

function spawnAgent(r, c) {
    agents.push(new Agent(r, c));
}