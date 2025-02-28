document.addEventListener('DOMContentLoaded', function() {
    // ハンバーガーメニューの制御
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-container');

    if (hamburgerMenu && sidebar && mainContent) {
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
    }

    // 質問アイテムのクラスを状態に基づいて更新
    const questionItems = document.querySelectorAll('.question-item');
    
    questionItems.forEach(item => {
        // 解決済みボタンの有無で状態を判断
        const resolveButton = item.querySelector('.btn-outline');
        
        if (!resolveButton) {
            item.classList.add('resolved');
        } else {
            item.classList.add('unsolved');
        }
    });

    // サイドバーのタイプフィルター
    const typeFilterItems = document.querySelectorAll('.sidebar-item[data-filter-type]');
    const instructorStatusSection = document.getElementById('instructorStatusSection');
    
    typeFilterItems.forEach(item => {
        item.addEventListener('click', function() {
            // アクティブクラスを全て削除
            typeFilterItems.forEach(i => i.classList.remove('active'));
            
            // クリックされた項目にアクティブクラスを追加
            this.classList.add('active');
            
            const filterType = this.dataset.filterType;
            
            // 講師が選択された場合のみステータスセクションを表示
            if (filterType === 'instructor') {
                instructorStatusSection.style.display = 'block';
                instructorStatusSection.classList.add('visible');
            } else {
                instructorStatusSection.classList.remove('visible');
                instructorStatusSection.style.display = 'none';
                
                // ステータスフィルターをリセット
                const allStatusItem = document.querySelector('.filter-tab[data-filter-status="all"]');
                if (allStatusItem) {
                    allStatusItem.classList.add('active');
                    document.querySelectorAll('.filter-tab[data-filter-status]:not([data-filter-status="all"])').forEach(i => {
                        i.classList.remove('active');
                    });
                }
            }
            
            // ページを1に戻す
            currentPage = 1;
            
            // 質問リストを再レンダリング
            renderQuestionList();
        });
    });

    // 講師ステータスフィルターのイベントリスナー
    const statusFilterItems = document.querySelectorAll('.filter-tab[data-filter-status]');
    statusFilterItems.forEach(item => {
        item.addEventListener('click', function() {
            // アクティブクラスを全て削除
            statusFilterItems.forEach(i => i.classList.remove('active'));
            
            // クリックされた項目にアクティブクラスを追加
            this.classList.add('active');
            
            // ページを1に戻す
            currentPage = 1;
            
            // 質問リストを再レンダリング
            renderQuestionList();
        });
    });
    
    // グローバル変数の定義位置を修正
    let currentPage = 1;
    const itemsPerPage = 10; // 1ページあたりの表示件数
    let totalItems = document.querySelectorAll('.question-item').length;
    let currentSearchTerm = ''; // 現在の検索ワードを保持する変数

    // 表示するアイテムの切り替え - フィルタリングを考慮
    function updateVisibleItems() {
        const questionItems = document.querySelectorAll('.question-item');
        
        // フィルタリングされていないアイテムを取得
        const visibleItems = Array.from(questionItems).filter(item => 
            item.dataset.filteredOut !== 'true'
        );
        
        // 総アイテム数を更新
        totalItems = visibleItems.length;
        
        // すべてのアイテムを一旦非表示にする
        questionItems.forEach(item => {
            item.style.display = 'none';
        });
        
        // 現在のページに表示すべきアイテムだけを表示する
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, visibleItems.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            if (visibleItems[i]) {
                visibleItems[i].style.display = 'flex';
            }
        }
        
        // ページネーション情報を更新
        updatePaginationInfo();
    }

    // ページネーション情報の更新関数（統合版）
    function updatePaginationInfo(totalItems, startIndex, endIndex) {
        // 引数がない場合は古い実装の動作を維持
        if (arguments.length === 0) {
            const visibleItems = Array.from(document.querySelectorAll('.question-item')).filter(item => 
                item.dataset.filteredOut !== 'true' && item.style.display !== 'none'
            );
            totalItems = visibleItems.length;
            startIndex = (currentPage - 1) * itemsPerPage;
            endIndex = Math.min(startIndex + itemsPerPage, totalItems);
        }
        
        const startItem = totalItems > 0 ? startIndex + 1 : 0;
        const endItem = endIndex;
        
        // ページネーション情報の更新
        const paginationInfo = document.querySelector('.pagination-info');
        if (paginationInfo) {
            paginationInfo.textContent = `${startItem}-${endItem} / ${totalItems} 件`;
        }
        
        // ボタンの有効/無効状態の更新
        const prevButton = document.querySelector('.prev-btn');
        const nextButton = document.querySelector('.next-btn');
        
        if (prevButton) {
            prevButton.disabled = currentPage <= 1;
        }
        
        if (nextButton) {
            const maxPage = Math.ceil(totalItems / itemsPerPage);
            nextButton.disabled = currentPage >= maxPage || totalItems === 0;
        }
    }

    // ページネーションボタンのイベントリスナー
    const prevButton = document.querySelector('.prev-btn');
    const nextButton = document.querySelector('.next-btn');
    
    if (prevButton) {
        prevButton.addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                renderQuestionList(); // 質問リストを再レンダリング
            }
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            const totalItems = getFilteredQuestionCount();
            const maxPage = Math.ceil(totalItems / itemsPerPage);
            if (currentPage < maxPage) {
                currentPage++;
                renderQuestionList(); // 質問リストを再レンダリング
            }
        });
    }

    // 初期表示の設定
    updateVisibleItems();

    // フィルタリング関数の修正
    function filterQuestions() {
        console.log('Filtering questions...');
        const activeTypeItem = document.querySelector('.sidebar-item[data-filter-type].active');
        const activeType = activeTypeItem ? activeTypeItem.dataset.filterType : 'all';
        
        const activeStatusItem = document.querySelector('.filter-tab[data-filter-status].active');
        const activeStatus = (instructorStatusSection.style.display === 'none' || !activeStatusItem) ? 'all' : 
                            activeStatusItem.dataset.filterStatus;
        
        console.log('Active filters:', activeType, activeStatus);
        
        const questionItems = document.querySelectorAll('.question-item');
        
        questionItems.forEach(item => {
            // デフォルトではフィルタリングされていない
            item.dataset.filteredOut = 'false';
            
            // タイプフィルター
            let typeMatch = true;
            if (activeType !== 'all') {
                if (activeType === 'ai') {
                    typeMatch = item.querySelector('.badge-ai') !== null;
                } else if (activeType === 'instructor') {
                    typeMatch = item.querySelector('.badge-instructor') !== null;
                }
            }
            
            // ステータスフィルター（講師タブ選択時のみ適用）
            let statusMatch = true;
            if (activeType === 'instructor' && activeStatus !== 'all') {
                if (activeStatus === 'pending') {
                    // 解決済みボタンがあり、通知バッジがない場合は「質問送信済み」
                    statusMatch = item.querySelector('.btn-outline') !== null && 
                                 item.querySelector('.notification-badge') === null;
                } else if (activeStatus === 'unread') {
                    // 通知バッジがある場合は「未読」
                    statusMatch = item.querySelector('.notification-badge') !== null;
                } else if (activeStatus === 'read') {
                    // 解決済みボタンがなく、通知バッジもない場合は「既読」
                    statusMatch = item.querySelector('.btn-outline') === null && 
                                 item.querySelector('.notification-badge') === null;
                }
            }
            
            // 両方の条件に一致する場合のみ表示対象とする
            if (!typeMatch || !statusMatch) {
                item.dataset.filteredOut = 'true';
            }
        });
        
        // ページを1に戻す
        currentPage = 1;
        
        // 表示アイテムを更新
        updateVisibleItems();
        
        // サイドバーのカウント数を更新
        updateSidebarCounts();
    }

    // サイドバーのカウント数を更新する関数
    function updateSidebarCounts() {
        // 未読メッセージの件数を取得（AIチャットは除外）
        const allUnreadCount = questionData.filter(q => q.isUnread).length;
        const aiUnreadCount = 0; // AIチャットは常に既読なので0
        const instructorUnreadCount = questionData.filter(q => q.type === 'instructor' && q.isUnread).length;
        
        // 質問送信済みの件数を取得
        const pendingCount = questionData.filter(q => q.type === 'instructor' && q.isPending).length;
        
        // 既読（未読でなく、質問送信済みでもない講師への質問）の件数を取得
        const readCount = questionData.filter(q => q.type === 'instructor' && !q.isUnread && !q.isPending).length;
        
        // サイドバーのカウントを更新
        document.querySelector('.sidebar-item[data-filter-type="all"] .sidebar-count').textContent = allUnreadCount > 0 ? allUnreadCount : '';
        document.querySelector('.sidebar-item[data-filter-type="ai"] .sidebar-count').textContent = ''; // AIは常に空
        document.querySelector('.sidebar-item[data-filter-type="instructor"] .sidebar-count').textContent = instructorUnreadCount > 0 ? instructorUnreadCount : '';
        
        // フィルターチップのカウントも更新
        const allChip = document.querySelector('.filter-chip[data-filter-type="all"] .chip-count');
        if (allChip) {
            if (allUnreadCount > 0) {
                allChip.textContent = allUnreadCount;
                allChip.style.display = ''; // 表示
            } else {
                allChip.textContent = '';
                allChip.style.display = 'none'; // 非表示
            }
        }
        
        const aiChip = document.querySelector('.filter-chip[data-filter-type="ai"] .chip-count');
        if (aiChip) {
            aiChip.textContent = ''; // AIは常に空
            aiChip.style.display = 'none'; // 常に非表示
        }
        
        const instructorChip = document.querySelector('.filter-chip[data-filter-type="instructor"] .chip-count');
        if (instructorChip) {
            if (instructorUnreadCount > 0) {
                instructorChip.textContent = instructorUnreadCount;
                instructorChip.style.display = ''; // 表示
            } else {
                instructorChip.textContent = '';
                instructorChip.style.display = 'none'; // 非表示
            }
        }
        
        // 各フィルタータブのカウントを更新
        const pendingTab = document.querySelector('.filter-tab[data-filter-status="pending"]');
        if (pendingTab) {
            pendingTab.dataset.count = pendingCount;
        }
        
        const unreadTab = document.querySelector('.filter-tab[data-filter-status="unread"]');
        if (unreadTab) {
            unreadTab.dataset.count = instructorUnreadCount;
        }
        
        const readTab = document.querySelector('.filter-tab[data-filter-status="read"]');
        if (readTab) {
            readTab.dataset.count = readCount;
        }
        
        const allTab = document.querySelector('.filter-tab[data-filter-status="all"]');
        if (allTab) {
            // すべての講師への質問の数
            const allInstructorCount = questionData.filter(q => q.type === 'instructor').length;
            allTab.dataset.count = allInstructorCount;
        }
        
        // フィルタータブのカウント表示を更新
        updateFilterTabCounts();
    }

    // フィルタータブのカウント表示を更新する関数
    function updateFilterTabCounts() {
        // すべてのフィルタータブを取得
        const filterTabs = document.querySelectorAll('.filter-tab[data-filter-status]');
        
        filterTabs.forEach(tab => {
            // data-count属性の値を取得
            const count = tab.dataset.count;
            
            // カウントが0より大きい場合のみ表示
            if (count && parseInt(count) > 0) {
                tab.setAttribute('data-count', count);
            } else {
                // カウントが0の場合は属性を削除または空にする
                tab.setAttribute('data-count', '0'); // 明示的に0を設定
            }
        });
        
        // 最後にナビゲーションバッジも更新
        updateNavBadge();
    }

    // 未読の質問数を取得する関数
    function getUnreadCount() {
        // 講師への未読質問の数をカウント
        return questionData.filter(q => q.type === 'instructor' && q.isUnread).length;
    }

    // サイドバーの未読バッジを更新する関数
    function updateNavBadge() {
        const unreadCount = getUnreadCount();
        const navBadge = document.querySelector('.nav-badge');
        
        if (navBadge) {
            if (unreadCount > 0) {
                navBadge.textContent = unreadCount;
            } else {
                navBadge.textContent = '';
            }
        }
    }

    // 「続きを読む」ボタンの機能
    const readMoreButtons = document.querySelectorAll('.read-more-btn');
    
    readMoreButtons.forEach(button => {
        button.addEventListener('click', function() {
            const content = this.closest('.question-text-content');
            content.classList.toggle('expanded');
            
            if (content.classList.contains('expanded')) {
                this.textContent = '折りたたむ';
            } else {
                this.textContent = '続きを読む';
            }
        });
    });

    // 解決済みにするボタンの機能
    const resolveButtons = document.querySelectorAll('.btn-outline');

    resolveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const questionItem = this.closest('.question-item');
            
            // 質問アイテムのクラスを更新
            questionItem.classList.remove('unsolved');
            questionItem.classList.add('resolved');
            
            // 解決済みボタンを削除
            this.remove();
            
            // フィルタリングを更新
            filterQuestions();
        });
    });
    
    // スクロール時のヘッダーボーダー制御
    const questionList = document.querySelector('.question-list');
    const contentHeader = document.querySelector('.question-content-header');
    
    if (questionList && contentHeader) {
        // スクロールイベントリスナーを追加
        questionList.addEventListener('scroll', function() {
            // スクロール位置が0より大きい場合はボーダーを表示
            if (questionList.scrollTop > 0) {
                contentHeader.classList.add('with-border');
            } else {
                contentHeader.classList.remove('with-border');
            }
        });
    }

    // 質問アイテムのクリックイベント
    questionItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // オプションボタンのクリックは伝播させない
            if (e.target.closest('.option-btn')) {
                return;
            }
            
            // チャット詳細ページへ遷移
            console.log('チャット詳細を表示:', this.querySelector('.action-name').textContent);
            // window.location.href = 'chat-detail.html?id=' + this.dataset.chatId;
        });
    });
    
    // オプションボタンのクリックイベント
    const moreButtons = document.querySelectorAll('.more-btn');
    
    moreButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // 親要素へのクリックイベントの伝播を防止
            
            // 他のオプションメニューを閉じる
            document.querySelectorAll('.question-options.active').forEach(item => {
                if (item !== this.closest('.question-options')) {
                    item.classList.remove('active');
                }
            });
            
            // クリックされたオプションメニューの表示/非表示を切り替え
            this.closest('.question-options').classList.toggle('active');
        });
    });
    
    // ドキュメント全体のクリックでオプションメニューを閉じる
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.question-options')) {
            document.querySelectorAll('.question-options.active').forEach(item => {
                item.classList.remove('active');
            });
        }
    });
    
    // 削除ボタンのクリックイベント
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const questionItem = this.closest('.question-item');
            const questionId = parseInt(questionItem.dataset.id);
            
            // 削除確認モーダルを表示
            showDeleteConfirmModal(questionId);
            
            // ドロップダウンを閉じる
            this.closest('.options-dropdown').classList.remove('active');
        });
    });
    
    // 未読/既読の切り替え（デモ用）
    questionItems.forEach(item => {
        // ダブルクリックで未読/既読を切り替え（デモ用）
        item.addEventListener('dblclick', function(e) {
            this.classList.toggle('unread');
            console.log(this.classList.contains('unread') ? '未読にしました' : '既読にしました');
            
            // サイドバーのカウント数を更新
            updateSidebarCounts();
        });
    });

    // コース、アクションマップ、アクションのサンプルデータ
    const courseData = {
        courses: [
            {
                name: "Webエンジニア養成",
                actionMaps: [
                    {
                        name: "フロントエンド開発マスター",
                        actions: [
                            "モダンHTML/CSS設計手法",
                            "JavaScript/TypeScript実践",
                            "Reactコンポーネント設計",
                            "パフォーマンス最適化技術"
                        ]
                    },
                    {
                        name: "バックエンド技術体系",
                        actions: [
                            "Node.jsサーバー構築",
                            "データベース設計と最適化",
                            "RESTful API設計原則",
                            "認証・認可システム実装"
                        ]
                    },
                    {
                        name: "実践Webアプリケーション開発",
                        actions: [
                            "フルスタックアプリ設計",
                            "CI/CDパイプライン構築",
                            "テスト駆動開発の実践",
                            "セキュリティ対策の実装"
                        ]
                    }
                ]
            },
            {
                name: "UI/UXデザイン実践",
                actionMaps: [
                    {
                        name: "ユーザー中心設計プロセス",
                        actions: [
                            "ユーザーリサーチ手法",
                            "ペルソナとカスタマージャーニー",
                            "情報アーキテクチャ設計",
                            "ユーザビリティテスト実施"
                        ]
                    },
                    {
                        name: "インターフェースデザイン実践",
                        actions: [
                            "視覚デザインの原則と実践",
                            "レスポンシブUIデザイン",
                            "アクセシビリティ対応デザイン",
                            "デザインシステム構築"
                        ]
                    },
                    {
                        name: "プロトタイピングと検証",
                        actions: [
                            "ローファイプロトタイピング",
                            "インタラクティブプロトタイプ作成",
                            "ユーザーテストの設計と実施",
                            "反復的デザイン改善プロセス"
                        ]
                    }
                ]
            },
            {
                name: "データサイエンス基礎",
                actionMaps: [
                    {
                        name: "データ分析基礎技法",
                        actions: [
                            "Pythonによるデータ処理",
                            "統計分析の基礎と応用",
                            "データ可視化テクニック",
                            "探索的データ分析の実践"
                        ]
                    },
                    {
                        name: "機械学習アルゴリズム入門",
                        actions: [
                            "教師あり学習の基礎",
                            "教師なし学習手法",
                            "モデル評価と選択",
                            "深層学習入門"
                        ]
                    },
                    {
                        name: "ビジネスデータ活用実践",
                        actions: [
                            "ビジネスKPI設計と分析",
                            "顧客行動分析の手法",
                            "予測モデルの業務適用",
                            "データ分析レポーティング"
                        ]
                    }
                ]
            },
            {
                name: "モバイルアプリ開発",
                actionMaps: [
                    {
                        name: "クロスプラットフォーム開発",
                        actions: [
                            "React Nativeアプリ開発",
                            "Flutterフレームワーク活用",
                            "クロスプラットフォームの設計パターン",
                            "パフォーマンス最適化手法"
                        ]
                    },
                    {
                        name: "ネイティブアプリ開発",
                        actions: [
                            "Swift/iOS開発基礎",
                            "Kotlin/Android開発基礎",
                            "ネイティブUIコンポーネント実装",
                            "デバイス機能の活用手法"
                        ]
                    },
                    {
                        name: "モバイルUX設計",
                        actions: [
                            "モバイル特有のUXパターン",
                            "ジェスチャーとインタラクション設計",
                            "オフライン対応アプリ設計",
                            "モバイルアプリのユーザビリティテスト"
                        ]
                    }
                ]
            },
            {
                name: "クラウドエンジニアリング",
                actionMaps: [
                    {
                        name: "AWSクラウド環境構築",
                        actions: [
                            "EC2/ECSによるサーバー構築",
                            "RDS/DynamoDBデータベース設計",
                            "S3/CloudFrontによるコンテンツ配信",
                            "IAMセキュリティ設計"
                        ]
                    },
                    {
                        name: "マイクロサービスアーキテクチャ",
                        actions: [
                            "サービス分割の設計手法",
                            "APIゲートウェイの構築",
                            "コンテナオーケストレーション",
                            "分散システムのモニタリング"
                        ]
                    },
                    {
                        name: "DevOpsワークフロー実践",
                        actions: [
                            "GitHubワークフロー設計",
                            "CI/CDパイプライン構築",
                            "インフラのコード化（IaC）",
                            "モニタリングとロギング設計"
                        ]
                    }
                ]
            },
            {
                name: "ビジネスDX実践",
                actionMaps: [
                    {
                        name: "デジタルマーケティング戦略",
                        actions: [
                            "デジタルマーケティング基礎",
                            "SEO/SEM最適化手法",
                            "SNSマーケティング実践",
                            "マーケティングオートメーション"
                        ]
                    },
                    {
                        name: "データドリブン経営",
                        actions: [
                            "ビジネスデータ分析基礎",
                            "KPI設計とダッシュボード構築",
                            "A/Bテスト設計と実施",
                            "データに基づく意思決定プロセス"
                        ]
                    },
                    {
                        name: "アジャイルプロジェクト管理",
                        actions: [
                            "スクラム開発手法の実践",
                            "カンバンによるタスク管理",
                            "アジャイルチームビルディング",
                            "継続的改善プロセス"
                        ]
                    }
                ]
            }
        ]
    };

    // ランダムなコースパスを生成する関数
    function getRandomCoursePath() {
        const courseIndex = Math.floor(Math.random() * courseData.courses.length);
        const course = courseData.courses[courseIndex];
        
        const actionMapIndex = Math.floor(Math.random() * course.actionMaps.length);
        const actionMap = course.actionMaps[actionMapIndex];
        
        const actionIndex = Math.floor(Math.random() * actionMap.actions.length);
        const action = actionMap.actions[actionIndex];
        
        return {
            path: `${course.name} > ${actionMap.name}`,
            action: action
        };
    }

    // 質問アイテムのaction-pathとaction-nameを更新する関数
    function updateQuestionItems() {
        const questionItems = document.querySelectorAll('.question-item');
        
        questionItems.forEach(item => {
            const coursePath = getRandomCoursePath();
            
            // action-pathを更新
            const actionPathElement = item.querySelector('.action-path');
            if (actionPathElement) {
                actionPathElement.textContent = coursePath.path;
            }
            
            // action-nameを更新
            const actionNameElement = item.querySelector('.action-name');
            if (actionNameElement) {
                actionNameElement.textContent = coursePath.action;
            }
        });
    }

    // ヘッダーとサイドバーのドロップダウンを更新
    const headerDropdowns = document.querySelectorAll('.header-dropdown');
    headerDropdowns.forEach(dropdown => {
        dropdown.innerHTML = '<option>スキルプラス</option>';
    });
    
    // 質問アイテムのコースパスを更新
    updateQuestionItems();

    // 質問アイテムのサンプルデータ
    const questionData = [
        {
            id: 1,
            type: "ai",
            path: "Webエンジニア養成 / フロントエンド開発マスター",
            name: "Reactコンポーネント設計",
            message: "Reactコンポーネントの設計について質問があります。再利用可能なコンポーネントを作成する際のベストプラクティスを教えてください。",
            date: new Date(new Date().setDate(new Date().getDate() - 3)), // 3日前
            isUnread: false, // AIチャットは常に既読
            isPending: false
        },
        {
            id: 2,
            type: "instructor",
            path: "データサイエンス基礎 / 機械学習アルゴリズム入門",
            name: "教師あり学習の基礎",
            message: "教師あり学習のアルゴリズムについて質問があります。分類と回帰の違いについて詳しく教えていただけますか？",
            date: new Date(new Date().setDate(new Date().getDate() - 5)), // 5日前
            isUnread: true,
            isPending: false // 講師から回答済み
        },
        {
            id: 3,
            type: "ai",
            path: "プログラミング入門 / JavaScript基礎",
            name: "配列操作のベストプラクティス",
            message: "JavaScriptの配列操作について質問があります。map, filter, reduceの使い分けについて教えてください。",
            date: new Date(new Date().setDate(new Date().getDate() - 7)), // 1週間前
            isUnread: false, // AIチャットは常に既読
            isPending: false
        },
        {
            id: 4,
            type: "instructor",
            path: "データベース設計 / SQL実践",
            name: "複雑なJOINクエリの書き方",
            message: "複数テーブルを結合する複雑なSQLクエリの書き方について質問があります。特にパフォーマンスを考慮した方法を教えてください。",
            date: new Date(new Date().setDate(new Date().getDate() - 14)), // 2週間前
            isUnread: false,
            isPending: false
        },
        {
            id: 5,
            type: "ai",
            path: "UI/UXデザイン / モバイルデザイン原則",
            name: "レスポンシブデザインのベストプラクティス",
            message: "モバイルファーストのレスポンシブデザインについて質問があります。異なる画面サイズに対応するための効果的な方法を教えてください。",
            date: new Date(new Date().setDate(new Date().getDate() - 2)), // 2日前
            isUnread: true,
            isPending: false
        },
        {
            id: 6,
            type: "instructor",
            path: "クラウドコンピューティング / AWS基礎",
            name: "S3とEC2の連携方法",
            message: "AWSのS3とEC2を連携させる方法について質問があります。特にセキュリティを考慮した設定方法を教えてください。",
            date: new Date(new Date().setDate(new Date().getDate() - 10)), // 10日前
            isUnread: false,
            isPending: true // 質問送信済み、講師からの回答待ち
        },
        {
            id: 7,
            type: "ai",
            path: "アルゴリズムとデータ構造 / 探索アルゴリズム",
            name: "二分探索の実装方法",
            message: "二分探索アルゴリズムの実装について質問があります。特にエッジケースの処理方法について詳しく教えてください。",
            date: new Date(new Date().setDate(new Date().getDate() - 1)), // 1日前
            isUnread: true,
            isPending: false
        },
        {
            id: 8,
            type: "instructor",
            path: "セキュリティ / Webアプリケーションセキュリティ",
            name: "XSS攻撃の防止方法",
            message: "クロスサイトスクリプティング（XSS）攻撃を防ぐための効果的な方法について質問があります。具体的な実装例も含めて教えていただけますか？",
            date: new Date(new Date().setDate(new Date().getDate() - 4)), // 4日前
            isUnread: false,
            isPending: false
        },
        {
            id: 9,
            type: "ai",
            path: "バックエンド開発 / Node.js実践",
            name: "非同期処理のベストプラクティス",
            message: "Node.jsにおける非同期処理のベストプラクティスについて質問があります。Promise, async/awaitの効果的な使い方を教えてください。",
            date: new Date(new Date().setHours(new Date().getHours() - 5)), // 5時間前
            isUnread: false,
            isPending: false
        },
        {
            id: 10,
            type: "instructor",
            path: "モバイルアプリ開発 / React Native入門",
            name: "ネイティブモジュールの統合方法",
            message: "React Nativeでネイティブモジュールを統合する方法について質問があります。iOSとAndroid両方に対応する方法を教えてください。",
            date: new Date(new Date().setHours(new Date().getHours() - 2)), // 2時間前
            isUnread: true,
            isPending: false
        },
        {
            id: 11,
            type: "ai",
            path: "DevOps / CI/CD実践",
            name: "GitHubActionsの設定方法",
            message: "GitHub Actionsを使ったCI/CDパイプラインの設定方法について質問があります。特にテストと自動デプロイの設定例を教えてください。",
            date: new Date(new Date().setMinutes(new Date().getMinutes() - 30)), // 30分前
            isUnread: true,
            isPending: false
        },
        {
            id: 12,
            type: "instructor",
            path: "プロジェクト管理 / アジャイル開発手法",
            name: "スクラムの効果的な導入方法",
            message: "小規模チームにスクラム開発手法を導入する効果的な方法について質問があります。特に初めての導入時の注意点を教えてください。",
            date: new Date(), // 現在（たった今）
            isUnread: true,
            isPending: false
        }
    ];

    // 日付をフォーマットする関数
    function formatDate(date) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // 今日の0時0分
        const targetDate = new Date(date);
        
        // 日付部分だけの比較用
        const targetDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
        
        if (targetDay.getTime() === today.getTime()) {
            // 本日の場合は時刻を表示
            return targetDate.getHours().toString().padStart(2, '0') + ':' + 
                   targetDate.getMinutes().toString().padStart(2, '0');
        } else {
            // 本日以外の場合は日付を表示
            return (targetDate.getMonth() + 1) + '月' + targetDate.getDate() + '日';
        }
    }

    // 質問リストを生成する関数
    function renderQuestionList() {
        const questionList = document.querySelector('.question-list');
        
        // リストをクリア
        questionList.innerHTML = '';
        
        // フィルタリングを適用
        const activeTypeItem = document.querySelector('.sidebar-item[data-filter-type].active');
        const activeType = activeTypeItem ? activeTypeItem.dataset.filterType : 'all';
        
        const instructorStatusSection = document.getElementById('instructorStatusSection');
        const activeStatusItem = document.querySelector('.filter-tab[data-filter-status].active');
        const activeStatus = (instructorStatusSection.style.display === 'none' || !activeStatusItem) ? 'all' : 
                            activeStatusItem.dataset.filterStatus;
        
        console.log('Rendering with filters:', activeType, activeStatus);
        
        // フィルタリング条件に基づいてデータをフィルタリング
        let filteredData = [...questionData];
        
        // AIチャットはすべて既読状態に設定
        filteredData.forEach(question => {
            if (question.type === 'ai') {
                question.isUnread = false;
            }
        });
        
        // タイプフィルター
        if (activeType !== 'all') {
            filteredData = filteredData.filter(q => q.type === activeType);
        }
        
        // ステータスフィルター（講師の場合のみ）
        if (activeType === 'instructor' && activeStatus !== 'all') {
            if (activeStatus === 'unread') {
                filteredData = filteredData.filter(q => q.isUnread);
            } else if (activeStatus === 'read') {
                filteredData = filteredData.filter(q => !q.isUnread && !q.isPending);
            } else if (activeStatus === 'pending') {
                filteredData = filteredData.filter(q => q.isPending);
            }
        }
        
        // 日付順（新しい順）にソート
        filteredData.sort((a, b) => {
            // Date オブジェクトを比較
            return new Date(b.date) - new Date(a.date);
        });
        
        // 総アイテム数
        const totalItems = filteredData.length;
        
        // 最大ページ数を計算
        const maxPage = Math.ceil(totalItems / itemsPerPage);
        
        // 現在のページが最大ページを超えないようにする
        if (currentPage > maxPage && maxPage > 0) {
            currentPage = maxPage;
        } else if (currentPage < 1 || maxPage === 0) {
            currentPage = 1;
        }
        
        // ページネーション
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
        
        // 現在のページのアイテムを取得
        const currentPageItems = filteredData.slice(startIndex, endIndex);
        
        // 各質問アイテムをレンダリング
        currentPageItems.forEach(question => {
            // 質問アイテムのクラスを設定
            let itemClasses = 'question-item';
            if (question.isUnread) itemClasses += ' unread';
            if (question.isPending && question.type === 'instructor') itemClasses += ' pending';
            
            // 日付をフォーマット
            const formattedDate = formatDate(question.date);
            
            // メッセージプレビューを設定（質問送信済みの場合は冒頭に追加）
            const messagePreview = question.isPending && question.type === 'instructor'
                ? `<span class="pending-text">質問送信済み — </span>${question.message}`
                : question.message;
            
            // HTMLを生成
            const questionHTML = `
                <div class="${itemClasses}" data-id="${question.id}" data-type="${question.type}">
                    <!-- 左側：アイコン -->
                    <div class="question-icon">
                        <span class="badge badge-type badge-${question.type}">${question.type === 'ai' ? 'AI' : '講師'}</span>
                    </div>
                    
                    <!-- 中央：メインコンテンツ -->
                    <div class="question-item-content">
                        <div class="action-path">${question.path}</div>
                        <div class="action-name">${question.name}</div>
                        <div class="message-preview">${messagePreview}</div>
                    </div>
                    
                    <!-- 右側：日付とオプション -->
                    <div class="question-item-side">
                        <div class="question-date">${formattedDate}</div>
                        <div class="question-options">
                            <button class="option-btn more-btn" title="その他">
                                <svg class="option-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="5" r="1" />
                                    <circle cx="12" cy="12" r="1" />
                                    <circle cx="12" cy="19" r="1" />
                                </svg>
                            </button>
                            <div class="options-dropdown">
                                <button class="dropdown-item delete-btn">
                                    <svg class="dropdown-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                    </svg>
                                    <span>削除</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // リストに追加
            questionList.innerHTML += questionHTML;
        });
        
        // 質問アイテムのイベントリスナーを設定
        setupQuestionItemListeners();
        
        // ページネーション情報を更新
        updatePaginationInfo(totalItems, startIndex, endIndex);
        
        // フィルタータブのカウントを更新
        updateSidebarCounts();
    }

    // 質問アイテムのイベントリスナーを設定
    function setupQuestionItemListeners() {
        // オプションボタンのクリックイベント
        const moreButtons = document.querySelectorAll('.more-btn');
        moreButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // 他のドロップダウンを閉じる
                document.querySelectorAll('.question-options.active').forEach(item => {
                    if (item !== this.parentElement) {
                        item.classList.remove('active');
                    }
                });
                
                // このドロップダウンを開閉
                this.parentElement.classList.toggle('active');
            });
        });
        
        // 削除ボタンのクリックイベント
        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                
                const questionItem = this.closest('.question-item');
                const questionId = parseInt(questionItem.dataset.id);
                
                // 削除確認モーダルを表示
                showDeleteConfirmModal(questionId);
                
                // ドロップダウンを閉じる
                this.closest('.options-dropdown').classList.remove('active');
            });
        });
        
        // 質問アイテムのクリックイベント（詳細表示など）
        const questionItems = document.querySelectorAll('.question-item');
        questionItems.forEach(item => {
            item.addEventListener('click', function() {
                const questionId = parseInt(this.dataset.id);
                console.log(`質問ID: ${questionId} がクリックされました`);
                
                // 未読状態を既読に変更
                const questionIndex = questionData.findIndex(q => q.id === questionId);
                if (questionIndex !== -1 && questionData[questionIndex].isUnread) {
                    questionData[questionIndex].isUnread = false;
                    this.classList.remove('unread');
                    
                    // サイドバーのカウントを更新
                    updateSidebarCounts();
                }
            });
        });
    }

    // 削除確認モーダルを表示する関数
    function showDeleteConfirmModal(questionId) {
        const modal = document.getElementById('deleteConfirmModal');
        const closeBtn = modal.querySelector('.modal-close-btn');
        const cancelBtn = modal.querySelector('.modal-cancel-btn');
        const confirmBtn = modal.querySelector('.modal-confirm-btn');
        
        // モーダルを表示
        modal.classList.add('active');
        
        // 閉じるボタンのイベント
        closeBtn.onclick = function() {
            modal.classList.remove('active');
        };
        
        // キャンセルボタンのイベント
        cancelBtn.onclick = function() {
            modal.classList.remove('active');
        };
        
        // 確認ボタンのイベント
        confirmBtn.onclick = function() {
            // 質問を削除
            deleteQuestion(questionId);
            
            // モーダルを閉じる
            modal.classList.remove('active');
        };
        
        // モーダル外クリックで閉じる
        window.onclick = function(event) {
            if (event.target === modal) {
                modal.classList.remove('active');
            }
        };
    }

    // 質問を削除する関数
    function deleteQuestion(id) {
        const questionIndex = questionData.findIndex(q => q.id === id);
        
        if (questionIndex !== -1) {
            // データから削除
            questionData.splice(questionIndex, 1);
            
            // リストを再レンダリング
            renderQuestionList();
            
            // サイドバーのカウントを更新
            updateSidebarCounts();
        }
    }

    // 講師からの回答を受け取る関数
    function receiveInstructorAnswer(questionId, answerData) {
        const questionIndex = questionData.findIndex(q => q.id === questionId);
        
        if (questionIndex !== -1) {
            // 質問のステータスを更新
            questionData[questionIndex].isPending = false; // 質問送信済み状態を解除
            questionData[questionIndex].isUnread = true; // 未読状態にする
            
            // 回答データを追加（実際の実装に合わせて調整）
            // questionData[questionIndex].answers = [...(questionData[questionIndex].answers || []), answerData];
            
            // リストを再レンダリング
            renderQuestionList();
            
            // サイドバーのカウントを更新
            updateSidebarCounts();
        }
    }

    // 質問リストを生成
    renderQuestionList();
    
    // サイドバーのカウントを更新
    updateSidebarCounts();

    // フィルタリング機能
    function setupFilters() {
        // タイプフィルター（全て、AI、講師）
        const typeFilterItems = document.querySelectorAll('.sidebar-item[data-filter-type]');
        typeFilterItems.forEach(item => {
            item.addEventListener('click', function() {
                // アクティブクラスを切り替え
                typeFilterItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                
                const filterType = this.dataset.filterType;
                
                // ページを1に戻す
                currentPage = 1;
                
                // 質問リストを再レンダリング
                renderQuestionList();
            });
        });
    }

    // フィルターを適用する関数
    function applyFilters(type) {
        // フィルタリング条件に基づいて表示するデータを選択
        let filteredData = [...questionData];
        
        if (type !== 'all') {
            filteredData = filteredData.filter(q => q.type === type);
        }
        
        // フィルタリングされたデータでリストを再レンダリング
        renderFilteredQuestionList(filteredData);
    }

    // フィルタリングされた質問リストをレンダリングする関数
    function renderFilteredQuestionList(filteredData) {
        const questionList = document.querySelector('.question-list');
        
        // リストをクリア
        questionList.innerHTML = '';
        
        // フィルタリングされたデータでリストを生成
        filteredData.forEach(question => {
            // 質問アイテムのHTMLを生成（renderQuestionList関数と同様）
            // ...
        });
        
        // イベントリスナーを設定
        setupQuestionItemListeners();
    }

    // 新しい質問を追加する関数を修正
    function addNewQuestion(questionData) {
        // 新しいIDを生成（既存の最大ID + 1）
        const maxId = Math.max(...questionData.map(q => q.id), 0);
        const newId = maxId + 1;
        
        // 新しい質問オブジェクトを作成
        const newQuestion = {
            id: newId,
            type: "ai", // デフォルト値
            path: "新しい質問",
            name: "タイトル未設定",
            message: "質問内容がここに表示されます。",
            date: new Date(), // 現在の日時
            isUnread: false, // AIチャットは常に既読
            isPending: false // デフォルトはfalse
        };
        
        // データに追加
        questionData.unshift(newQuestion); // 先頭に追加
        
        // リストを再レンダリング
        renderQuestionList();
        
        // サイドバーのカウントを更新
        updateSidebarCounts();
        
        return newId; // 新しい質問のIDを返す
    }

    // 質問を編集する関数
    function editQuestion(id, updatedData) {
        const questionIndex = questionData.findIndex(q => q.id === id);
        
        if (questionIndex !== -1) {
            // 既存のデータと更新データをマージ
            questionData[questionIndex] = {
                ...questionData[questionIndex],
                ...updatedData
            };
            
            // リストを再レンダリング
            renderQuestionList();
        }
    }

    // 質問を削除する関数
    function deleteQuestion(id) {
        const questionIndex = questionData.findIndex(q => q.id === id);
        
        if (questionIndex !== -1) {
            // データから削除
            questionData.splice(questionIndex, 1);
            
            // リストを再レンダリング
            renderQuestionList();
            
            // サイドバーのカウントを更新
            updateSidebarCounts();
        }
    }

    // フィルタリングされた質問の数を取得する関数
    function getFilteredQuestionCount() {
        const activeTypeItem = document.querySelector('.sidebar-item[data-filter-type].active');
        const activeType = activeTypeItem ? activeTypeItem.dataset.filterType : 'all';
        
        const instructorStatusSection = document.getElementById('instructorStatusSection');
        const activeStatusItem = document.querySelector('.filter-tab[data-filter-status].active');
        const activeStatus = (instructorStatusSection.style.display === 'none' || !activeStatusItem) ? 'all' : 
                            activeStatusItem.dataset.filterStatus;
        
        // フィルタリング条件に基づいてデータをフィルタリング
        let filteredData = [...questionData];
        
        // AIチャットはすべて既読状態に設定
        filteredData.forEach(question => {
            if (question.type === 'ai') {
                question.isUnread = false;
            }
        });
        
        // タイプフィルター
        if (activeType !== 'all') {
            filteredData = filteredData.filter(q => q.type === activeType);
        }
        
        // ステータスフィルター（講師の場合のみ）
        if (activeType === 'instructor' && activeStatus !== 'all') {
            if (activeStatus === 'unread') {
                filteredData = filteredData.filter(q => q.isUnread);
            } else if (activeStatus === 'read') {
                filteredData = filteredData.filter(q => !q.isUnread && !q.isPending);
            } else if (activeStatus === 'pending') {
                filteredData = filteredData.filter(q => q.isPending);
            }
        }
        
        return filteredData.length;
    }

    // 講師への質問を追加する関数
    function addInstructorQuestion(questionData) {
        // 新しいIDを生成（既存の最大ID + 1）
        const maxId = Math.max(...questionData.map(q => q.id), 0);
        const newId = maxId + 1;
        
        // 新しい質問オブジェクトを作成
        const newQuestion = {
            id: newId,
            type: "instructor",
            path: "講師への質問",
            name: "タイトル未設定",
            message: "質問内容がここに表示されます。",
            date: new Date(), // 現在の日時
            isUnread: false, // 講師からの回答がまだないので未読ではない
            isPending: true // 質問送信済み状態
        };
        
        // データに追加
        questionData.unshift(newQuestion); // 先頭に追加
        
        // リストを再レンダリング
        renderQuestionList();
        
        // サイドバーのカウントを更新
        updateSidebarCounts();
        
        return newId; // 新しい質問のIDを返す
    }

    // 検索機能の実装
    function setupSearchBar() {
        const searchInput = document.querySelector('.search-input');
        const searchButton = document.querySelector('.search-button');
        
        if (!searchInput) return;
        
        // 検索入力イベント
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            
            // 検索語が空の場合、全アイテムを表示
            if (searchTerm === '') {
                clearSearch();
                return;
            }
        });
        
        // 検索ボタンクリックイベント
        if (searchButton) {
            searchButton.addEventListener('click', function() {
                const searchTerm = searchInput.value.toLowerCase().trim();
                if (searchTerm !== '') {
                    performSearch(searchTerm);
                }
            });
        }
        
        // Enterキー押下イベント
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = this.value.toLowerCase().trim();
                if (searchTerm !== '') {
                    performSearch(searchTerm);
                }
            }
        });
    }

    // 検索を実行する関数
    function performSearch(searchTerm) {
        // 検索ワードを保存（ハイライト表示に使用）
        currentSearchTerm = searchTerm;
        
        // 現在のフィルター状態を保存
        const activeTypeItem = document.querySelector('.sidebar-item[data-filter-type].active');
        const activeType = activeTypeItem ? activeTypeItem.dataset.filterType : 'all';
        
        const instructorStatusSection = document.getElementById('instructorStatusSection');
        const activeStatusItem = document.querySelector('.filter-tab[data-filter-status].active');
        const activeStatus = (instructorStatusSection.style.display === 'none' || !activeStatusItem) ? 'all' : 
                            activeStatusItem.dataset.filterStatus;
        
        // フィルタリング条件に基づいてデータをフィルタリング
        let filteredData = [...questionData];
        
        // AIチャットはすべて既読状態に設定
        filteredData.forEach(question => {
            if (question.type === 'ai') {
                question.isUnread = false;
            }
        });
        
        // タイプフィルター
        if (activeType !== 'all') {
            filteredData = filteredData.filter(q => q.type === activeType);
        }
        
        // ステータスフィルター（講師の場合のみ）
        if (activeType === 'instructor' && activeStatus !== 'all') {
            if (activeStatus === 'unread') {
                filteredData = filteredData.filter(q => q.isUnread);
            } else if (activeStatus === 'read') {
                filteredData = filteredData.filter(q => !q.isUnread && !q.isPending);
            } else if (activeStatus === 'pending') {
                filteredData = filteredData.filter(q => q.isPending);
            }
        }
        
        // 検索語でさらにフィルタリング
        filteredData = filteredData.filter(question => {
            const nameMatch = question.name.toLowerCase().includes(searchTerm.toLowerCase());
            const pathMatch = question.path.toLowerCase().includes(searchTerm.toLowerCase());
            const messageMatch = question.message.toLowerCase().includes(searchTerm.toLowerCase());
            
            return nameMatch || pathMatch || messageMatch;
        });
        
        // 検索結果でリストを再レンダリング
        renderSearchResults(filteredData, searchTerm);
    }

    // 検索結果をレンダリングする関数
    function renderSearchResults(filteredData, searchTerm) {
        const questionList = document.querySelector('.question-list');
        
        // リストをクリア
        questionList.innerHTML = '';
        
        // 日付順（新しい順）にソート
        filteredData.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
        
        // 総アイテム数
        const totalItems = filteredData.length;
        
        // 最大ページ数を計算
        const maxPage = Math.ceil(totalItems / itemsPerPage);
        
        // 現在のページが最大ページを超えないようにする
        if (currentPage > maxPage && maxPage > 0) {
            currentPage = maxPage;
        } else if (currentPage < 1 || maxPage === 0) {
            currentPage = 1;
        }
        
        // ページネーション
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
        
        // 現在のページのアイテムを取得
        const currentPageItems = filteredData.slice(startIndex, endIndex);
        
        // 検索結果がない場合のメッセージ
        if (currentPageItems.length === 0) {
            questionList.innerHTML = `
                <div class="question-item" style="justify-content: center; padding: 24px; text-align: center; color: var(--text-secondary);">
                    <p>検索結果がありません。別のキーワードで試してください。</p>
                </div>
            `;
        } else {
            // 各質問アイテムをレンダリング
            currentPageItems.forEach(question => {
                // 質問アイテムのクラスを設定
                let itemClasses = 'question-item';
                if (question.isUnread) itemClasses += ' unread';
                if (question.isPending && question.type === 'instructor') itemClasses += ' pending';
                
                // 日付をフォーマット
                const formattedDate = formatDate(question.date);
                
                // 検索ワードでハイライトされたテキストを生成
                const highlightedName = highlightText(question.name, searchTerm);
                const highlightedPath = highlightText(question.path, searchTerm);
                
                // メッセージプレビューの処理（質問送信済みの場合は考慮）
                let messageText = question.message;
                let highlightedMessage = highlightText(messageText, searchTerm);
                
                const messagePreview = question.isPending && question.type === 'instructor'
                    ? `<span class="pending-text">質問送信済み — </span>${highlightedMessage}`
                    : highlightedMessage;
                
                // HTMLを生成
                const questionHTML = `
                    <div class="${itemClasses}" data-id="${question.id}" data-type="${question.type}">
                        <!-- 左側：アイコン -->
                        <div class="question-icon">
                            <span class="badge badge-type badge-${question.type}">${question.type === 'ai' ? 'AI' : '講師'}</span>
                        </div>
                        
                        <!-- 中央：メインコンテンツ -->
                        <div class="question-item-content">
                            <div class="action-path">${highlightedPath}</div>
                            <div class="action-name">${highlightedName}</div>
                            <div class="message-preview">${messagePreview}</div>
                        </div>
                        
                        <!-- 右側：日付とオプション -->
                        <div class="question-item-side">
                            <div class="question-date">${formattedDate}</div>
                            <div class="question-options">
                                <button class="option-btn more-btn" title="その他">
                                    <svg class="option-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="5" r="1" />
                                        <circle cx="12" cy="12" r="1" />
                                        <circle cx="12" cy="19" r="1" />
                                    </svg>
                                </button>
                                <div class="options-dropdown">
                                    <button class="dropdown-item delete-btn">
                                        <svg class="dropdown-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                        </svg>
                                        <span>削除</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                // リストに追加
                questionList.innerHTML += questionHTML;
            });
        }
        
        // 質問アイテムのイベントリスナーを設定
        setupQuestionItemListeners();
        
        // ページネーション情報を更新
        updatePaginationInfo(totalItems, startIndex, endIndex);
    }

    // 検索をクリアする関数
    function clearSearch() {
        // 検索ワードをクリア
        currentSearchTerm = '';
        
        // 通常の質問リストを再レンダリング
        renderQuestionList();
    }

    // 検索機能のセットアップ
    setupSearchBar();

    // テキスト内の検索ワードをハイライト表示する関数
    function highlightText(text, searchTerm) {
        if (!searchTerm || !text) return text;
        
        // 検索ワードをエスケープして正規表現で使えるようにする
        const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // 大文字小文字を区別しない正規表現を作成
        const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
        
        // 検索ワードにマッチする部分をハイライト用のspanで囲む
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }

    // HTMLを含むテキスト内の検索ワードをハイライト表示する関数
    function highlightHTMLSafely(html, searchTerm) {
        if (!searchTerm || !html) return html;
        
        // DOMParserを使用してHTMLを解析
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
        const container = doc.body.firstChild;
        
        // テキストノードを再帰的に処理する関数
        function processNode(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                // テキストノードの場合、検索ワードをハイライト
                if (node.textContent.trim() !== '') {
                    const highlightedText = highlightText(node.textContent, searchTerm);
                    if (highlightedText !== node.textContent) {
                        const span = doc.createElement('span');
                        span.innerHTML = highlightedText;
                        node.parentNode.replaceChild(span, node);
                    }
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                // 要素ノードの場合、子ノードを再帰的に処理
                // ただし、すでにハイライト用のspanの場合は処理しない
                if (node.className !== 'search-highlight') {
                    Array.from(node.childNodes).forEach(processNode);
                }
            }
        }
        
        // コンテナ内のすべてのノードを処理
        Array.from(container.childNodes).forEach(processNode);
        
        // 処理後のHTMLを返す
        return container.innerHTML;
    }

    // ウィンドウサイズ変更時のサイドバー調整
    function adjustSidebarOnResize() {
    const sidebar = document.querySelector('.sidebar');
        const hamburgerMenu = document.querySelector('.hamburger-menu');
        
        // ウィンドウサイズが変わったときの処理
        window.addEventListener('resize', function() {
            // デスクトップサイズになったらサイドバーを表示
            if (window.innerWidth > 767) {
                sidebar.classList.remove('active');
                hamburgerMenu.classList.remove('active');
            }
        });
    }

    // リサイズ時のサイドバー調整
    adjustSidebarOnResize();

    // オーバーレイのクリックイベント
    function setupOverlay() {
        const overlay = document.querySelector('.sidebar-overlay');
        const sidebar = document.querySelector('.sidebar');
        const hamburgerMenu = document.querySelector('.hamburger-menu');
        
        if (overlay) {
            overlay.addEventListener('click', function() {
            sidebar.classList.remove('active');
            hamburgerMenu.classList.remove('active');
            });
        }
    }

    // モバイルフィルターチップの設定
    function setupMobileFilterChips() {
        console.log('Setting up mobile filter chips...');
        
        const filterChips = document.querySelectorAll('.filter-chip');
        const sidebarItems = document.querySelectorAll('.sidebar-item[data-filter-type]');
        
        if (!filterChips.length) {
            console.log('No filter chips found');
            return; // フィルターチップがなければ終了
        }
        
        console.log('Found filter chips:', filterChips.length);
        
        // フィルターチップのクリックイベント
        filterChips.forEach(chip => {
            console.log('Adding click event to chip:', chip.dataset.filterType);
            
            // 既存のイベントリスナーを削除（重複防止）
            chip.removeEventListener('click', filterChipClickHandler);
            
            // 新しいイベントリスナーを追加
            chip.addEventListener('click', filterChipClickHandler);
        });
        
        // フィルターチップのクリックハンドラー関数
        function filterChipClickHandler(event) {
            console.log('Filter chip clicked:', this.dataset.filterType);
            
            // アクティブクラスを全て削除
            filterChips.forEach(c => c.classList.remove('active'));
            
            // クリックされた項目にアクティブクラスを追加
            this.classList.add('active');
            
            const filterType = this.dataset.filterType;
            
            // サイドバーの対応する項目も同期して選択状態にする
            sidebarItems.forEach(item => {
                if (item.dataset.filterType === filterType) {
                    item.classList.add('active');
                    
                    // サイドバー項目のクリックイベントを発火させる
                    const clickEvent = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    });
                    item.dispatchEvent(clickEvent);
                } else {
                    item.classList.remove('active');
                }
            });
            
            // カウントを更新
            setTimeout(updateSidebarCounts, 50);
            
            // イベントの伝播を停止
            event.stopPropagation();
        }
        
        // 初期状態の設定
        updateSidebarCounts();
    }

    // DOMContentLoadedイベントの最後に以下を追加
    setupMobileFilterChips();

    /**
     * サイドバーとフィルターチップのカウントを更新する統合関数
     */
    function updateCounts() {
        // questionDataが利用可能な場合はそれを使用
        if (typeof questionData !== 'undefined' && Array.isArray(questionData)) {
            // 未読メッセージの件数を取得
            const allUnreadCount = questionData.filter(q => q.isUnread).length;
            const aiUnreadCount = 0; // AIチャットは常に既読なので0
            const instructorUnreadCount = questionData.filter(q => q.type === 'instructor' && q.isUnread).length;
            
            // 質問送信済みの件数を取得
            const pendingCount = questionData.filter(q => q.type === 'instructor' && q.isPending).length;
            
            // 既読の件数を取得
            const readCount = questionData.filter(q => q.type === 'instructor' && !q.isUnread && !q.isPending).length;
            
            // サイドバーのカウントを更新
            const allSidebarCount = document.querySelector('.sidebar-item[data-filter-type="all"] .sidebar-count');
            if (allSidebarCount) {
                allSidebarCount.textContent = allUnreadCount > 0 ? allUnreadCount : '';
            }
            
            const aiSidebarCount = document.querySelector('.sidebar-item[data-filter-type="ai"] .sidebar-count');
            if (aiSidebarCount) {
                aiSidebarCount.textContent = ''; // AIは常に空
            }
            
            const instructorSidebarCount = document.querySelector('.sidebar-item[data-filter-type="instructor"] .sidebar-count');
            if (instructorSidebarCount) {
                instructorSidebarCount.textContent = instructorUnreadCount > 0 ? instructorUnreadCount : '';
            }
            
            // フィルターチップのカウントを更新
            const allChip = document.querySelector('.filter-chip[data-filter-type="all"] .chip-count');
            if (allChip) {
                allChip.textContent = allUnreadCount > 0 ? allUnreadCount : '';
            }
            
            const aiChip = document.querySelector('.filter-chip[data-filter-type="ai"] .chip-count');
            if (aiChip) {
                aiChip.textContent = ''; // AIは常に空
            }
            
            const instructorChip = document.querySelector('.filter-chip[data-filter-type="instructor"] .chip-count');
            if (instructorChip) {
                instructorChip.textContent = instructorUnreadCount > 0 ? instructorUnreadCount : '';
            }
            
            // 各フィルタータブのカウントを更新
            const pendingTab = document.querySelector('.filter-tab[data-filter-status="pending"]');
            if (pendingTab) {
                pendingTab.dataset.count = pendingCount;
            }
            
            const unreadTab = document.querySelector('.filter-tab[data-filter-status="unread"]');
            if (unreadTab) {
                unreadTab.dataset.count = instructorUnreadCount;
            }
            
            const readTab = document.querySelector('.filter-tab[data-filter-status="read"]');
            if (readTab) {
                readTab.dataset.count = readCount;
            }
            
            const allTab = document.querySelector('.filter-tab[data-filter-status="all"]');
            if (allTab) {
                // すべての講師への質問の数
                const allInstructorCount = questionData.filter(q => q.type === 'instructor').length;
                allTab.dataset.count = allInstructorCount;
            }
        } else {
            // questionDataが利用できない場合はDOM要素から直接カウント
            // 質問アイテムを取得
            const questionItems = document.querySelectorAll('.question-item');
            
            // 未読メッセージをカウント
            let allUnreadCount = 0;
            let aiUnreadCount = 0;
            let instructorUnreadCount = 0;
            
            questionItems.forEach(item => {
                // 未読かどうかをチェック（通知バッジがあるかどうか）
                const isUnread = item.querySelector('.notification-badge') !== null;
                
                if (isUnread) {
                    allUnreadCount++;
                    
                    // タイプに応じてカウント
                    if (item.querySelector('.badge-ai') !== null) {
                        aiUnreadCount++;
                    } else if (item.querySelector('.badge-instructor') !== null) {
                        instructorUnreadCount++;
                    }
                }
            });
            
            // サイドバーのカウントを更新
            const allSidebarCount = document.querySelector('.sidebar-item[data-filter-type="all"] .sidebar-count');
            if (allSidebarCount) {
                allSidebarCount.textContent = allUnreadCount > 0 ? allUnreadCount : '';
            }
            
            const aiSidebarCount = document.querySelector('.sidebar-item[data-filter-type="ai"] .sidebar-count');
            if (aiSidebarCount) {
                aiSidebarCount.textContent = ''; // AIは常に空
            }
            
            const instructorSidebarCount = document.querySelector('.sidebar-item[data-filter-type="instructor"] .sidebar-count');
            if (instructorSidebarCount) {
                instructorSidebarCount.textContent = instructorUnreadCount > 0 ? instructorUnreadCount : '';
            }
            
            // フィルターチップのカウントを更新
            const allChip = document.querySelector('.filter-chip[data-filter-type="all"] .chip-count');
            if (allChip) {
                allChip.textContent = allUnreadCount > 0 ? allUnreadCount : '';
            }
            
            const aiChip = document.querySelector('.filter-chip[data-filter-type="ai"] .chip-count');
            if (aiChip) {
                aiChip.textContent = ''; // AIは常に空
            }
            
            const instructorChip = document.querySelector('.filter-chip[data-filter-type="instructor"] .chip-count');
            if (instructorChip) {
                instructorChip.textContent = instructorUnreadCount > 0 ? instructorUnreadCount : '';
            }
        }
        
        // フィルタータブのカウント表示を更新
        updateFilterTabCounts();
        
        // アクティブなサイドバー項目に対応するチップもアクティブに
        const activeSidebarItem = document.querySelector('.sidebar-item.active');
        if (activeSidebarItem) {
            const filterType = activeSidebarItem.dataset.filterType;
            document.querySelectorAll('.filter-chip').forEach(chip => {
                chip.classList.toggle('active', chip.dataset.filterType === filterType);
            });
        }
    }

    // questionDataが定義されていない場合は初期化
    if (typeof questionData === 'undefined') {
        // ダミーデータを作成
        window.questionData = [
            { id: 1, type: 'ai', isUnread: false, isPending: false },
            { id: 2, type: 'instructor', isUnread: true, isPending: false },
            { id: 3, type: 'instructor', isUnread: true, isPending: false },
            { id: 4, type: 'instructor', isUnread: true, isPending: false },
            { id: 5, type: 'instructor', isUnread: false, isPending: true }
        ];
    }

    // DOM要素から未読メッセージをカウントする関数
    function countUnreadMessagesFromDOM() {
        const questionItems = document.querySelectorAll('.question-item');
        let allUnreadCount = 0;
        let aiUnreadCount = 0;
        let instructorUnreadCount = 0;
        
        questionItems.forEach(item => {
            // 未読かどうかをチェック（通知バッジがあるかどうか）
            const notificationBadge = item.querySelector('.notification-badge');
            const isUnread = notificationBadge !== null;
            
            if (isUnread) {
                allUnreadCount++;
                
                // タイプに応じてカウント
                if (item.querySelector('.badge-ai')) {
                    aiUnreadCount++;
                } else if (item.querySelector('.badge-instructor')) {
                    instructorUnreadCount++;
                }
            }
        });
        
        return {
            all: allUnreadCount,
            ai: aiUnreadCount,
            instructor: instructorUnreadCount
        };
    }

    // デバッグ用のコード
    function debugChipCounts() {
        const allChip = document.querySelector('.filter-chip[data-filter-type="all"] .chip-count');
        const aiChip = document.querySelector('.filter-chip[data-filter-type="ai"] .chip-count');
        const instructorChip = document.querySelector('.filter-chip[data-filter-type="instructor"] .chip-count');
        
        console.log('All chip:', allChip ? allChip.textContent : 'not found');
        console.log('AI chip:', aiChip ? aiChip.textContent : 'not found');
        console.log('Instructor chip:', instructorChip ? instructorChip.textContent : 'not found');
        
        // 要素のスタイルを確認
        if (allChip) {
            console.log('All chip style:', window.getComputedStyle(allChip));
        }
    }

    // 関数を呼び出す
    setTimeout(debugChipCounts, 1000);

    // DOMContentLoadedイベントの最後に以下を追加
    // updateCounts関数を呼び出す
    setTimeout(function() {
        if (typeof updateCounts === 'function') {
            updateCounts();
            console.log('updateCounts called');
        } else {
            console.error('updateCounts function not found');
        }
    }, 500);

    // デバッグ用の関数
    function debugChipCounts() {
        const allChip = document.querySelector('.filter-chip[data-filter-type="all"] .chip-count');
        const aiChip = document.querySelector('.filter-chip[data-filter-type="ai"] .chip-count');
        const instructorChip = document.querySelector('.filter-chip[data-filter-type="instructor"] .chip-count');
        
        console.log('All chip:', allChip ? allChip.textContent : 'not found');
        console.log('AI chip:', aiChip ? aiChip.textContent : 'not found');
        console.log('Instructor chip:', instructorChip ? instructorChip.textContent : 'not found');
    }

    // デバッグ関数を呼び出す
    setTimeout(debugChipCounts, 1000);

    // 既読ボタンのイベントリスナーを追加
    function setupReadStatusListeners() {
        // 既読ボタン（通知バッジの削除ボタンなど）を取得
        const readButtons = document.querySelectorAll('.mark-as-read-btn, .notification-badge');
        
        readButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                // クリックされた要素が通知バッジの場合
                if (this.classList.contains('notification-badge')) {
                    // 通知バッジを削除（既読にする）
                    this.remove();
                }
                
                // questionDataを更新（該当するメッセージを既読にする）
                const questionItem = this.closest('.question-item');
                if (questionItem && window.questionData) {
                    const questionId = questionItem.dataset.id;
                    const questionIndex = window.questionData.findIndex(q => q.id.toString() === questionId);
                    
                    if (questionIndex !== -1) {
                        window.questionData[questionIndex].isUnread = false;
                    }
                }
                
                // カウントを更新
                updateSidebarCounts();
                
                e.stopPropagation(); // イベントの伝播を停止
            });
        });
    }

    // DOMContentLoadedイベントの最後に以下を追加
    setupReadStatusListeners();

    // 質問リストが更新されるたびに既読状態のリスナーも更新
    const originalRenderQuestionList = window.renderQuestionList;
    if (typeof originalRenderQuestionList === 'function') {
        window.renderQuestionList = function() {
            originalRenderQuestionList.apply(this, arguments);
            // 質問リストが更新された後に既読状態のリスナーを設定
            setTimeout(setupReadStatusListeners, 50);
            // カウントも更新
            setTimeout(updateCounts, 100);
        };
    }

    // MutationObserverを使用して通知バッジの変更を検知
    function setupNotificationObserver() {
        // 質問リストを監視
        const questionList = document.querySelector('.question-list');
        if (!questionList) return;
        
        // オブザーバーの設定
        const observer = new MutationObserver(function(mutations) {
            let shouldUpdateCounts = false;
            
            mutations.forEach(function(mutation) {
                // 子ノードの追加・削除を検知
                if (mutation.type === 'childList') {
                    // 通知バッジの追加・削除を検知
                    const addedNodes = Array.from(mutation.addedNodes);
                    const removedNodes = Array.from(mutation.removedNodes);
                    
                    const hasNotificationBadge = node => 
                        node.nodeType === 1 && (
                            node.classList && node.classList.contains('notification-badge') ||
                            node.querySelector && node.querySelector('.notification-badge')
                        );
                    
                    if (addedNodes.some(hasNotificationBadge) || removedNodes.some(hasNotificationBadge)) {
                        shouldUpdateCounts = true;
                    }
                }
            });
            
            // 通知バッジの変更があった場合はカウントを更新
            if (shouldUpdateCounts) {
                if (typeof updateCounts === 'function') {
                    updateCounts();
                } else if (typeof updateChipCounts === 'function') {
                    updateChipCounts();
                }
            }
        });
        
        // 監視を開始
        observer.observe(questionList, {
            childList: true,
            subtree: true
        });
        
        return observer;
    }

    // DOMContentLoadedイベントの最後に以下を追加
    const notificationObserver = setupNotificationObserver();

    // フィルターチップのクリックイベント
    const filterChips = document.querySelectorAll('.filter-chip');
    filterChips.forEach(chip => {
        // 既存のイベントリスナーを削除（重複防止）
        chip.removeEventListener('click', filterChipClickHandler);
        
        // 新しいイベントリスナーを追加
        chip.addEventListener('click', filterChipClickHandler);
    });

    // フィルターチップのクリックハンドラー関数
    function filterChipClickHandler(event) {
        console.log('Filter chip clicked:', this.dataset.filterType);
        
        // アクティブクラスを全て削除
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        
        // クリックされた項目にアクティブクラスを追加
        this.classList.add('active');
        
        const filterType = this.dataset.filterType;
        
        // サイドバーの対応する項目も同期して選択状態にする
        const sidebarItems = document.querySelectorAll('.sidebar-item[data-filter-type]');
        sidebarItems.forEach(item => {
            if (item.dataset.filterType === filterType) {
                item.classList.add('active');
                
                // サイドバー項目のクリックイベントを発火させる
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                item.dispatchEvent(clickEvent);
            } else {
                item.classList.remove('active');
            }
        });
        
        // カウントを更新
        setTimeout(updateSidebarCounts, 50);
        
        // イベントの伝播を停止
        event.stopPropagation();
    }

    // フィルターチップのデバッグ
    function debugFilterChips() {
        const filterChips = document.querySelectorAll('.filter-chip');
        
        console.log('Filter chips count:', filterChips.length);
        
        filterChips.forEach(chip => {
            console.log('Chip:', chip.dataset.filterType);
            console.log('- Has click listeners:', getEventListeners(chip).click?.length > 0);
            console.log('- Style:', window.getComputedStyle(chip));
            console.log('- Position:', chip.getBoundingClientRect());
            
            // クリックイベントをテスト
            chip.addEventListener('click', function() {
                console.log('Test click on chip:', this.dataset.filterType);
            });
        });
    }

    // DOMContentLoadedイベントの最後に以下を追加
    setTimeout(debugFilterChips, 1000);
}); 