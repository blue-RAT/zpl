/* 简易跳高小游戏：宗沛霖跳跃
   2K操作版：d/f上跳，j/k快速落下，障碍物地面和空中，黑色怪物可远程射击
*/

(function() {
    // 创建并设置画布
    let canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'gameCanvas';
        document.body.appendChild(canvas);
    }
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    // 主角属性
    const player = {
        x: 100,
        y: 440,
        w: 120,
        h: 60,
        vy: 0,
        jumpPower: -18,
        fastFall: 12,
        gravity: 0.5,
        onGround: true
    };

    // 障碍物
    let obstacles = [];
    let obstacleTimer = 0;

    // 怪物
    let monsters = [];
    let monsterTimer = 0;

    // 子弹
    let bullets = [];

    // 分数
    let score = 0;
    let gameOver = false;
    let bestScore = localStorage.getItem('zpl_best_score') ? parseInt(localStorage.getItem('zpl_best_score')) : 0;

    // 加载主角图片
    const playerImg = new Image();
    playerImg.src = "player.png";
    let playerImgLoaded = false;
    playerImg.onload = function() {
        playerImgLoaded = true;
    };
    playerImg.onerror = function() {
        console.error("主角图片加载失败，请检查文件名和路径是否正确: player.png");
    };

    // 背景音乐
    const bgm = new Audio("radwimps-なんでもないや.MP3");
    bgm.loop = true;
    bgm.volume = 0.5;
    // 用户需点击页面后播放音乐
    document.body.addEventListener('click', function() {
        bgm.play();
    }, { once: true });

    // 绘制主角
    function drawPlayer() {
        ctx.save();
        if (playerImgLoaded) {
            ctx.drawImage(playerImg, player.x, player.y, player.w, player.h);
        } else {
            ctx.fillStyle = "#222";
            ctx.fillRect(player.x, player.y, player.w, player.h);
            ctx.fillStyle = "#fff";
            ctx.font = "24px sans-serif";
            ctx.fillText("宗沛霖", player.x + 10, player.y + 40);
        }
        ctx.restore();
    }

    // 绘制障碍物
    function drawObstacles() {
        ctx.fillStyle = "#e74c3c";
        obstacles.forEach(o => {
            ctx.fillRect(o.x, o.y, o.w, o.h);
        });
    }

    // 绘制怪物
    function drawMonsters() {
        ctx.fillStyle = "#111";
        monsters.forEach(m => {
            ctx.fillRect(m.x, m.y, m.w, m.h);
        });
    }

    // 绘制子弹
    function drawBullets() {
        ctx.fillStyle = "#00f";
        bullets.forEach(b => {
            ctx.fillRect(b.x, b.y, b.w, b.h);
        });
    }

    // 更新障碍物（密度减少，约每2秒出现一次）
    function updateObstacles() {
        obstacles.forEach(o => o.x -= 6);
        obstacles = obstacles.filter(o => o.x + o.w > 0);
        obstacleTimer--;
        if (obstacleTimer <= 0) {
            const isSky = Math.random() < 0.5;
            obstacles.push({
                x: 800,
                y: isSky ? 300 : 480,
                w: 40,
                h: 50
            });
            // 障碍物间隔由60帧改为120帧
            obstacleTimer = 120;
        }
    }

    // 更新怪物（每2秒出现一次）
    function updateMonsters() {
        monsters.forEach(m => m.x -= 8);
        monsters = monsters.filter(m => m.x + m.w > 0 && !m.hit);
        monsterTimer--;
        if (monsterTimer <= 0) {
            monsters.push({
                x: 800,
                y: 440,
                w: 60,
                h: 60,
                hit: false
            });
            monsterTimer = 120;
        }
    }

    // 更新子弹
    function updateBullets() {
        bullets.forEach(b => b.x += 16);
        bullets = bullets.filter(b => b.x < 800);
    }

    // 子弹击中怪物判定
    function checkBulletHit() {
        bullets.forEach(b => {
            monsters.forEach(m => {
                if (!m.hit &&
                    b.x < m.x + m.w &&
                    b.x + b.w > m.x &&
                    b.y < m.y + m.h &&
                    b.y + b.h > m.y) {
                    m.hit = true;
                    b.hit = true;
                }
            });
        });
        // 移除已命中的子弹
        bullets = bullets.filter(b => !b.hit);
    }

    // 怪物碰撞判定
    function checkMonsterCollision() {
        for (let m of monsters) {
            if (!m.hit &&
                player.x < m.x + m.w &&
                player.x + player.w > m.x &&
                player.y < m.y + m.h &&
                player.y + player.h > m.y) {
                gameOver = true;
            }
        }
    }

    // 碰撞检测
    function checkCollision() {
        for (let o of obstacles) {
            if (player.x < o.x + o.w &&
                player.x + player.w > o.x &&
                player.y < o.y + o.h &&
                player.y + player.h > o.y) {
                gameOver = true;
            }
        }
    }

    // 游戏主循环
    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 地面
        ctx.fillStyle = "#aaa";
        ctx.fillRect(0, 500, 800, 100);

        // 主角跳跃
        if (!player.onGround) {
            player.vy += player.gravity;
            player.y += player.vy;
            if (player.y >= 440) {
                player.y = 440;
                player.vy = 0;
                player.onGround = true;
            }
        }

        drawPlayer();
        drawObstacles();
        drawMonsters();
        drawBullets();
        updateObstacles();
        updateMonsters();
        updateBullets();
        checkCollision();
        checkMonsterCollision();
        checkBulletHit();

        // 分数和最高纪录
        ctx.fillStyle = "#333";
        ctx.font = "32px sans-serif";
        ctx.fillText("分数: " + score, 20, 50);
        ctx.font = "24px sans-serif";
        ctx.fillText("最高纪录: " + bestScore, 20, 90);

        if (!gameOver) {
            score++;
            requestAnimationFrame(loop);
        } else {
            // 更新最高纪录
            if (score > bestScore) {
                bestScore = score;
                localStorage.setItem('zpl_best_score', bestScore);
            }
            ctx.fillStyle = "#c0392b";
            ctx.font = "48px sans-serif";
            ctx.fillText("游戏结束", 320, 300);
            ctx.font = "24px sans-serif";
            ctx.fillText("按空格重新开始", 320, 350);
        }
    }

    // 跳跃事件和射击事件
    window.addEventListener('keydown', function(e) {
        if (e.code === 'Space') {
            if (gameOver) {
                obstacles = [];
                monsters = [];
                score = 0;
                player.y = 440;
                player.vy = 0;
                player.onGround = true;
                gameOver = false;
                loop();
            } else if (player.onGround) {
                player.vy = player.jumpPower;
                player.onGround = false;
            }
        }
        // 2K操作
        if (!gameOver) {
            if ((e.key === 'd' || e.key === 'f') && player.y > 50) {
                player.vy = player.jumpPower;
                player.onGround = false;
            }
            if ((e.key === 'j' || e.key === 'k') && !player.onGround) {
                player.vy = player.fastFall;
            }
            // J键远程射击
            if (e.key === 'j') {
                bullets.push({
                    x: player.x + player.w,
                    y: player.y + player.h / 2 - 5,
                    w: 20,
                    h: 10
                });
            }
        }
    });

    // 启动游戏
    loop();
})();
