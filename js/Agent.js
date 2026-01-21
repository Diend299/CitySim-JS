class Agent {
    constructor() {
        this.name = NameGen.get();
        // 初始位置：随机出生在某个格子里
        this.x = canvas.width/2; 
        this.y = canvas.height/2;
        this.target = null; // 目标 Building 对象

        this.house = null;
        this.job = null;
        
        this.state = 'IDLE'; // IDLE, MOVING, WORKING, HOME
        this.timer = 0;
        this.money = 0;
        
        this.gender = Math.random()>0.5 ? 'male':'female';
    }

    update() {
        this.think();
        this.move();
    }

    think() {
        if (this.target) return; // 在路上

        // 1. 找房子
        if (!this.house) {
            let h = MapSystem.findSpot('house');
            if (h) {
                this.house = h;
                h.people.push(this); // 占据名额
                Logger.add('sys', `${this.name} 入住了 ${h.data.name}`);
            }
        }

        // 2. 找工作
        if (!this.job) {
            let c = MapSystem.findSpot('company');
            if (c) {
                this.job = c;
                c.people.push(this);
                Logger.add('money', `${this.name} 入职了 ${c.data.name}`);
            }
        }

        // 3. 日常通勤
        if (this.state === 'IDLE' || this.state === 'HOME') {
            if (this.job) {
                this.target = this.job;
                this.state = 'MOVING_TO_WORK';
            }
        } else if (this.state === 'WORKING') {
            this.timer++;
            // 发工资 (每帧一点点)
            if (this.timer % 100 === 0) {
                this.money += this.job.data.salary;
                STATE.money += 10; // 给政府交税
            }

            if (this.timer > 200) { // 下班
                this.timer = 0;
                if (this.house) {
                    this.target = this.house;
                    this.state = 'MOVING_TO_HOME';
                } else {
                    this.state = 'IDLE'; // 流浪
                }
            }
        }
    }

    move() {
        if (!this.target) return;
        
        // 目标的屏幕坐标 (必须每一帧重新获取，因为地图可能会动)
        let tx = this.target.x + CONFIG.tileSize/2;
        let ty = this.target.y + CONFIG.tileSize/2;
        
        let dx = tx - this.x;
        let dy = ty - this.y;
        let dist = Math.sqrt(dx*dx + dy*dy);

        if (dist < 4) {
            // 到达
            this.x = tx; this.y = ty;
            if (this.state === 'MOVING_TO_WORK') this.state = 'WORKING';
            if (this.state === 'MOVING_TO_HOME') this.state = 'HOME';
            this.target = null;
        } else {
            // 移动
            this.x += (dx/dist) * 2 * CONFIG.speed;
            this.y += (dy/dist) * 2 * CONFIG.speed;
        }
    }

    draw(ctx) {
        if (this.state === 'WORKING' || this.state === 'HOME') return; // 进屋消失
        
        let img = this.gender==='male' ? ASSETS.man : ASSETS.woman;
        if (img.complete) ctx.drawImage(img, this.x-10, this.y-10, 20, 20);
        else {
            ctx.fillStyle = this.gender==='male'?'blue':'red';
            ctx.beginPath(); ctx.arc(this.x, this.y, 4, 0, Math.PI*2); ctx.fill();
        }
    }
}