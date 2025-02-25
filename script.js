document.addEventListener('DOMContentLoaded', function() {
    const fabButton = document.getElementById('fabButton');
    const fabMenu = document.getElementById('fabMenu');
    const chatModal = document.querySelector('.ai-chat-modal');
    const closeButton = document.querySelector('.close-chat-button');
    const sendButton = document.querySelector('.send-button');
    const textarea = document.querySelector('.chat-input textarea');
    const messagesContainer = document.querySelector('.chat-messages');
    const overlay = document.querySelector('.fab-overlay');

    // ヒントボタンのクリックハンドラ
    fabButton.addEventListener('click', function() {
        fabMenu.classList.toggle('active');
        overlay.classList.toggle('active');
    });

    // メニュー項目のクリックハンドラ
    const menuItems = document.querySelectorAll('.fab-menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const action = this.dataset.action;
            
            if (action === 'ai') {
                // AIと一緒に進めるを選択した場合
                chatModal.classList.add('active');
                overlay.classList.add('active'); // チャットモーダル表示時もオーバーレイを表示
            }
            
            // メニューを閉じる
            fabMenu.classList.remove('active');
        });
    });

    // オーバーレイクリックの処理
    overlay.addEventListener('click', function() {
        // FABメニューを閉じる
        fabMenu.classList.remove('active');
        overlay.classList.remove('active');
        
        // チャットモーダルも閉じる
        chatModal.classList.remove('active');
    });

    // チャットモーダルを閉じる（×ボタン）
    closeButton.addEventListener('click', function() {
        chatModal.classList.remove('active');
        overlay.classList.remove('active'); // オーバーレイも非表示
    });

    // メッセージ送信処理
    function sendMessage() {
        const message = textarea.value.trim();
        if (message) {
            // ユーザーメッセージを追加
            const userMessageHTML = `
                <div class="message user-message">
                    <div class="message-content">${message}</div>
                </div>
            `;
            messagesContainer.insertAdjacentHTML('beforeend', userMessageHTML);
            
            // テキストエリアをクリア
            textarea.value = '';
            
            // 最下部にスクロール
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    // 送信ボタンのクリックハンドラ
    sendButton.addEventListener('click', sendMessage);

    // Enterキーでの送信（Shift + Enterで改行）
    textarea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // ハンバーガーメニューの制御を追加
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-container');

    hamburgerMenu.addEventListener('click', function() {
        sidebar.classList.toggle('active');
        hamburgerMenu.classList.toggle('active');
    });

    // メインコンテンツクリックでメニューを閉じる
    mainContent.addEventListener('click', function() {
        if (sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            hamburgerMenu.classList.remove('active');
        }
    });

    // チェックリストモーダルの制御
    const checklistButton = document.getElementById('checklistButton');
    const checklistModal = document.querySelector('.checklist-modal');
    const closeChecklistButton = document.querySelector('.close-checklist-button');

    checklistButton.addEventListener('click', function() {
        checklistModal.classList.add('active');
    });

    closeChecklistButton.addEventListener('click', function() {
        checklistModal.classList.remove('active');
    });

    // モーダル外クリックで閉じる
    checklistModal.addEventListener('click', function(e) {
        if (e.target === checklistModal) {
            checklistModal.classList.remove('active');
        }
    });
}); 