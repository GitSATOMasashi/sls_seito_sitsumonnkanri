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
}); 