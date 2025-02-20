document.addEventListener('DOMContentLoaded', function() {
    // チェックボックスの状態を保存
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            localStorage.setItem(this.id, this.checked);
        });
        
        // 保存された状態を復元
        const saved = localStorage.getItem(checkbox.id);
        if (saved === 'true') {
            checkbox.checked = true;
        }
    });

    const fabButton = document.getElementById('fabButton');
    const fabMenu = document.getElementById('fabMenu');
    const body = document.body;
    
    // オーバーレイ要素を作成
    const overlay = document.createElement('div');
    overlay.className = 'fab-overlay';
    body.appendChild(overlay);
    
    fabButton.addEventListener('click', function() {
        fabMenu.classList.toggle('active');
        overlay.classList.toggle('active');
    });
    
    // オーバーレイクリックでメニューを閉じる
    overlay.addEventListener('click', function() {
        fabMenu.classList.remove('active');
        overlay.classList.remove('active');
    });
    
    // メニュー項目のクリックハンドラ
    const menuItems = document.querySelectorAll('.fab-menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const action = this.dataset.action;
            // ここに各アクションの処理を実装
            console.log('Selected action:', action);
            
            // メニューを閉じる
            fabMenu.classList.remove('active');
            overlay.classList.remove('active');
        });
    });
}); 