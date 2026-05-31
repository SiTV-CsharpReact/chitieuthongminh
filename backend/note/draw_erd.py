import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch

fig, ax = plt.subplots(1, 1, figsize=(28, 18))
ax.set_xlim(0, 28)
ax.set_ylim(0, 18)
ax.set_aspect('equal')
ax.axis('off')
fig.patch.set_facecolor('white')

HEADER_COLOR = '#2196F3'
HEADER_TEXT = 'white'
BODY_BG = '#ffffff'
BORDER_COLOR = '#333333'
TEXT_COLOR = '#333333'
PK_COLOR = '#FF9800'
FK_COLOR = '#4CAF50'
FONT_SIZE = 7.5
HEADER_FONT = 8.5

tables = {
    'User': {
        'pos': (0.5, 12.5),
        'fields': [
            ('Id', 'ObjectId', 'PK'),
            ('Email', 'string', ''),
            ('PasswordHash', 'string', ''),
            ('Name', 'string', ''),
            ('Avatar', 'string', ''),
            ('Role', 'string', ''),
            ('Provider', 'string', ''),
            ('ProviderId', 'string', ''),
        ]
    },
    'CreditCard': {
        'pos': (7.5, 10),
        'fields': [
            ('Id', 'ObjectId', 'PK'),
            ('Name', 'string', ''),
            ('Bank', 'string', ''),
            ('BankName', 'string', ''),
            ('BankLogo', 'string', ''),
            ('ImageUrl', 'string', ''),
            ('Link', 'string', ''),
            ('RegisterUrl', 'string', ''),
            ('AnnualFee', 'decimal', ''),
            ('CashbackRules', 'array<obj>', ''),
            ('MinSalary', 'decimal', ''),
            ('Description', 'string', ''),
            ('Benefits', 'array<str>', ''),
            ('CreditLimit', 'string', ''),
            ('InterestRate', 'string', ''),
            ('TermsPdfUrl', 'string', ''),
        ]
    },
    'SpendingData': {
        'pos': (0.5, 1.5),
        'fields': [
            ('Id', 'ObjectId', 'PK'),
            ('UserId', 'string', 'FK'),
            ('Amount', 'decimal', ''),
            ('Salary', 'decimal', ''),
            ('Category', 'string', ''),
            ('Date', 'DateTime', ''),
            ('Description', 'string', ''),
            ('IncomeLevel', 'string', ''),
            ('SpendingHabit', 'string', ''),
            ('CreditScoreRange', 'string', ''),
            ('RecommendedCardType', 'string', ''),
        ]
    },
    'CardPromotion': {
        'pos': (14.5, 10),
        'fields': [
            ('Id', 'ObjectId', 'PK'),
            ('Title', 'string', ''),
            ('Description', 'string', ''),
            ('ImageUrl', 'string', ''),
            ('DiscountRate', 'string', ''),
            ('CategoryTab', 'string', ''),
            ('SourceUrl', 'string', ''),
            ('StartDate', 'string', ''),
            ('ValidUntil', 'string', ''),
            ('ApplicableCards', 'array<str>', ''),
            ('CreatedAt', 'DateTime', ''),
            ('UpdatedAt', 'DateTime', ''),
        ]
    },
    'Category': {
        'pos': (14.5, 2.5),
        'fields': [
            ('Id', 'ObjectId', 'PK'),
            ('Name', 'string', ''),
            ('Color', 'string', ''),
            ('Icon', 'string', ''),
            ('MccCodes', 'array<str>', ''),
            ('IsFrequent', 'bool', ''),
        ]
    },
    'Article': {
        'pos': (21.5, 10),
        'fields': [
            ('Id', 'ObjectId', 'PK'),
            ('Title', 'string', ''),
            ('Slug', 'string', ''),
            ('Excerpt', 'string', ''),
            ('Content', 'string', ''),
            ('Category', 'string', ''),
            ('Author', 'string', ''),
            ('CoverImage', 'string', ''),
            ('CreatedAt', 'DateTime', ''),
            ('UpdatedAt', 'DateTime', ''),
        ]
    },
    'ArticleCategory': {
        'pos': (21.5, 2.5),
        'fields': [
            ('Id', 'ObjectId', 'PK'),
            ('Name', 'string', ''),
            ('Slug', 'string', ''),
            ('Description', 'string', ''),
            ('Color', 'string', ''),
            ('CreatedAt', 'DateTime', ''),
            ('UpdatedAt', 'DateTime', ''),
        ]
    },
    'ChatLog': {
        'pos': (7.5, 1.5),
        'fields': [
            ('Id', 'ObjectId', 'PK'),
            ('SessionId', 'string', ''),
            ('UserId', 'string', 'FK'),
            ('Message', 'string', ''),
            ('Reply', 'string', ''),
            ('Intent', 'string', ''),
            ('SuggestedCardIds', 'array<str>', ''),
            ('QuickReplies', 'array<str>', ''),
            ('ResponseTimeMs', 'int', ''),
            ('CreatedAt', 'DateTime', ''),
        ]
    },
}

TABLE_W = 5.8
ROW_H = 0.42
HEADER_H = 0.55

def draw_table(ax, name, x, y, fields):
    n = len(fields)
    h = HEADER_H + n * ROW_H + 0.1

    # Body background
    body = FancyBboxPatch((x, y - h + HEADER_H), TABLE_W, h - HEADER_H,
                          boxstyle="round,pad=0.02", facecolor=BODY_BG,
                          edgecolor=BORDER_COLOR, linewidth=1.2)
    ax.add_patch(body)

    # Header
    header = FancyBboxPatch((x, y), TABLE_W, HEADER_H,
                            boxstyle="round,pad=0.02", facecolor=HEADER_COLOR,
                            edgecolor=BORDER_COLOR, linewidth=1.2)
    ax.add_patch(header)
    ax.text(x + TABLE_W / 2, y + HEADER_H / 2, name,
            ha='center', va='center', fontsize=HEADER_FONT,
            fontweight='bold', color=HEADER_TEXT, fontfamily='sans-serif')

    # Fields
    for i, (fname, ftype, fkey) in enumerate(fields):
        fy = y - (i + 1) * ROW_H + 0.05
        # Separator line
        ax.plot([x, x + TABLE_W], [fy + ROW_H - 0.05, fy + ROW_H - 0.05],
                color='#dddddd', linewidth=0.5)
        
        # Key badge
        if fkey == 'PK':
            ax.text(x + 0.15, fy + ROW_H / 2 - 0.05, 'PK',
                    fontsize=5.5, fontweight='bold', color='white',
                    bbox=dict(boxstyle='round,pad=0.15', facecolor=PK_COLOR, edgecolor='none'),
                    va='center', fontfamily='sans-serif')
            name_x = x + 0.65
        elif fkey == 'FK':
            ax.text(x + 0.15, fy + ROW_H / 2 - 0.05, 'FK',
                    fontsize=5.5, fontweight='bold', color='white',
                    bbox=dict(boxstyle='round,pad=0.15', facecolor=FK_COLOR, edgecolor='none'),
                    va='center', fontfamily='sans-serif')
            name_x = x + 0.65
        else:
            name_x = x + 0.25

        ax.text(name_x, fy + ROW_H / 2 - 0.05, fname,
                fontsize=FONT_SIZE, color=TEXT_COLOR, va='center',
                fontweight='bold' if fkey else 'normal', fontfamily='sans-serif')
        ax.text(x + TABLE_W - 0.2, fy + ROW_H / 2 - 0.05, ftype,
                fontsize=FONT_SIZE - 0.5, color='#777777', va='center', ha='right',
                fontfamily='sans-serif')

    return (x, y, x + TABLE_W, y - h + HEADER_H)

# Draw all tables
rects = {}
for tname, tdata in tables.items():
    px, py = tdata['pos']
    rects[tname] = draw_table(ax, tname, px, py, tdata['fields'])

# Draw relationships
def draw_relation(ax, from_tbl, to_tbl, label='1:N'):
    fx, fy, fx2, fy2 = rects[from_tbl]
    tx, ty, tx2, ty2 = rects[to_tbl]
    
    # Calculate connection points
    from_cx = (fx + fx2) / 2
    from_cy = (fy + fy2) / 2
    to_cx = (tx + tx2) / 2
    to_cy = (ty + ty2) / 2
    
    # Determine best connection sides
    if abs(from_cy - to_cy) > abs(from_cx - to_cx):
        # Vertical connection
        if from_cy > to_cy:
            start = (from_cx, fy2)
            end = (to_cx, ty)
        else:
            start = (from_cx, fy)
            end = (to_cx, ty2)
    else:
        # Horizontal connection
        if from_cx < to_cx:
            start = (fx2, from_cy)
            end = (tx, to_cy)
        else:
            start = (fx, from_cy)
            end = (tx2, to_cy)
    
    ax.annotate('', xy=end, xytext=start,
                arrowprops=dict(arrowstyle='->', color='#555555', lw=1.5,
                               connectionstyle='arc3,rad=0.1'))
    
    mid_x = (start[0] + end[0]) / 2
    mid_y = (start[1] + end[1]) / 2
    ax.text(mid_x, mid_y + 0.2, label,
            fontsize=6.5, color='#555555', ha='center', va='center',
            fontweight='bold', fontfamily='sans-serif',
            bbox=dict(boxstyle='round,pad=0.2', facecolor='white', edgecolor='#cccccc', alpha=0.9))

draw_relation(ax, 'User', 'SpendingData', '1 : N')
draw_relation(ax, 'User', 'ChatLog', '1 : N')
draw_relation(ax, 'CreditCard', 'CardPromotion', '1 : N')
draw_relation(ax, 'ArticleCategory', 'Article', '1 : N')

# Title
ax.text(14, 17.5, 'Sơ đồ Cơ sở dữ liệu (ERD) — Hệ thống CredBack',
        fontsize=16, fontweight='bold', ha='center', va='center',
        color='#333333', fontfamily='sans-serif')
ax.text(14, 17.0, 'MongoDB — 8 Collections',
        fontsize=10, ha='center', va='center', color='#777777', fontfamily='sans-serif')

# Legend
legend_y = 16.3
ax.text(0.5, legend_y, 'Chú thích:', fontsize=8, fontweight='bold', color='#333', fontfamily='sans-serif')
ax.text(2.3, legend_y, 'PK', fontsize=6, fontweight='bold', color='white',
        bbox=dict(boxstyle='round,pad=0.15', facecolor=PK_COLOR, edgecolor='none'), va='center')
ax.text(3.0, legend_y, '= Khóa chính', fontsize=7, color='#555', va='center', fontfamily='sans-serif')
ax.text(5.5, legend_y, 'FK', fontsize=6, fontweight='bold', color='white',
        bbox=dict(boxstyle='round,pad=0.15', facecolor=FK_COLOR, edgecolor='none'), va='center')
ax.text(6.2, legend_y, '= Khóa ngoại', fontsize=7, color='#555', va='center', fontfamily='sans-serif')
ax.text(8.5, legend_y, '→ = Quan hệ 1:N', fontsize=7, color='#555', va='center', fontfamily='sans-serif')

plt.tight_layout()
plt.savefig('/Users/sivan/chitieuthongminh/backend/note/erd_diagram.png',
            dpi=200, bbox_inches='tight', facecolor='white', edgecolor='none')
print('✅ ERD saved!')
