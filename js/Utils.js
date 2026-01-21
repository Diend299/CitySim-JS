// 时间系统
const TimeSystem = {
    year: CONFIG.startYear,
    month: 1,
    day: 1,
    totalDays: 0,
    
    tick() {
        this.day++;
        this.totalDays++;
        if (this.day > 30) {
            this.day = 1;
            this.month++;
            if (this.month > 12) {
                this.month = 1;
                this.year++;
            }
        }
    },
    getDateStr() { return `${this.year}年${this.month}月${this.day}日`; }
};

// 命名系统
const NameGenerator = {
    surnames: "李王张刘陈杨黄赵周吴徐孙马朱胡郭何高林罗郑梁谢宋唐许韩".split(""),
    male: "伟强军平保国致远建国俊杰志强文昊浩然泰宇子轩浩宇".split(""),
    female: "芳娜敏静秀英丽娟文雅梦洁雅静雪丽雨嘉雨婷欣怡".split(""),
    
    gen(gender, fatherSurname = null) {
        const sur = fatherSurname || this.surnames[Math.floor(Math.random() * this.surnames.length)];
        const list = gender === 'male' ? this.male : this.female;
        const given = list[Math.floor(Math.random() * list.length)];
        return sur + given;
    }
};

// 日志系统
const Logger = {
    add(type, text) {
        const div = document.createElement('div');
        div.className = `log-item log-${type}`;
        div.innerHTML = `<span style="color:#666">[${TimeSystem.year}-${TimeSystem.month}]</span> ${text}`;
        const list = document.getElementById('gameLogList');
        list.prepend(div);
        if (list.children.length > 50) list.lastChild.remove();
    },
    clear() { document.getElementById('gameLogList').innerHTML = ''; }
};