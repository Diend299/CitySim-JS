const Logger = {
    add(type, text) {
        const list = document.getElementById('gameLogList');
        const div = document.createElement('div');
        div.className = `log-item log-${type}`;
        div.innerText = `[第${STATE.year}年] ${text}`;
        list.prepend(div);
        if (list.children.length > 50) list.lastChild.remove();
    }
};

const NameGen = {
    sur: "李王张刘陈杨赵黄周吴".split(""),
    given: "伟强军平明文花秀丽静".split(""),
    get() {
        return this.sur[Math.floor(Math.random()*10)] + this.given[Math.floor(Math.random()*10)];
    }
};