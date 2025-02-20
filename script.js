document.addEventListener('DOMContentLoaded', function() {
    const fabButton = document.getElementById('fabButton');
    const fabMenu = document.getElementById('fabMenu');
    const overlay = document.querySelector('.fab-overlay');

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
            console.log('Selected action:', action);
            
            // メニューを閉じる
            fabMenu.classList.remove('active');
            overlay.classList.remove('active');
        });
    });
}); 