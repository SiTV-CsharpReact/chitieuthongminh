import React, { SVGProps } from 'react';

export const Logo: React.FC<SVGProps<SVGSVGElement>> = ({ className, ...props }) => {
    return (
        <svg
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            className={className || "w-full h-full drop-shadow-2xl"}
            {...props}
        >
            <defs>
                {/* Gradient thẻ Xanh Lá mượt mà, sang trọng */}
                <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4ade80" />
                    <stop offset="40%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#14532d" />
                </linearGradient>
                {/* Gradient Vàng Kim cho chữ $ và Chip */}
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="50%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#a16207" />
                </linearGradient>
                {/* Bóng đổ cho thẻ và các chi tiết nổi */}
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow
                        dx={0}
                        dy={8}
                        stdDeviation={6}
                        floodColor="#000"
                        floodOpacity="0.4"
                    />
                </filter>
                {/* Hiệu ứng phát sáng cho các tia lấp lánh */}
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation={3} result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                {/* Hiệu ứng chuyển động (Animation) cho các ngôi sao */}
                <style
                    dangerouslySetInnerHTML={{
                        __html:
                            "\n                        @keyframes twinkle {\n                            0%, 100% { opacity: 0.1; transform: translateY(4px) scale(0.6); }\n                            50% { opacity: 1; transform: translateY(-4px) scale(1.2); }\n                        }\n                        @keyframes spinArrow {\n                            0%, 70% { transform: rotate(0deg); }\n                            85%, 100% { transform: rotate(360deg); }\n                        }\n                        .sparkle {\n                            transform-origin: center;\n                            transform-box: fill-box;\n                        }\n                        .sp-1 { animation: twinkle 2.5s ease-in-out infinite; }\n                        .sp-2 { animation: twinkle 3s ease-in-out infinite 0.8s; }\n                        .sp-3 { animation: twinkle 2s ease-in-out infinite 1.5s; }\n                        \n                        /* Hiệu ứng nhịp thở cho chữ $ */\n                        @keyframes dollarFloat {\n                            0%, 100% { transform: translateY(0px) scale(1); }\n                            50% { transform: translateY(-8px) scale(1.25); }\n                        }\n                        .dollar-anim {\n                            transform-origin: center;\n                            transform-box: fill-box;\n                            animation: dollarFloat 3s ease-in-out infinite;\n                        }\n                    "
                    }}
                />
            </defs>
            {/* LỚP QUỸ ĐẠO PHÍA SAU (Nửa vòng elip bị che) */}
            <g filter="url(#shadow)">
                {/* Đường vòng tròn ngang mờ phía sau tạo không gian 3D */}
                <path
                    d="M 20 100 A 80 35 0 0 1 180 100"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={4}
                    opacity="0.3"
                />
            </g>
            {/* Nhóm Thẻ 1 (Bên trái) */}
            <g transform="rotate(-15 100 100) translate(-15, 0)">
                {/* Bóng mờ phía sau thẻ */}
                <rect
                    x={50}
                    y={15}
                    width={100}
                    height={170}
                    rx={12}
                    fill="#000"
                    opacity="0.3"
                    filter="url(#shadow)"
                />
                {/* Thân Thẻ Ngân Hàng Dọc */}
                <rect x={50} y={15} width={100} height={170} rx={12} fill="url(#cardBg)" />
                {/* Họa tiết chìm hình tròn */}
                <circle
                    cx={120}
                    cy={140}
                    r={40}
                    fill="#ffffff"
                    opacity="0.05"
                    pointerEvents="none"
                />
                <circle
                    cx={140}
                    cy={160}
                    r={30}
                    fill="#ffffff"
                    opacity="0.05"
                    pointerEvents="none"
                />
                {/* Hiệu ứng viền nổi và ánh kính chéo thẻ */}
                <path
                    d="M 50 15 L 150 115 L 150 15 Z"
                    fill="#ffffff"
                    opacity="0.1"
                    pointerEvents="none"
                    style={{ mixBlendMode: "overlay" }}
                />
                <rect
                    x={51}
                    y={16}
                    width={98}
                    height={168}
                    rx={11}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    opacity="0.2"
                />
                {/* Chip Thẻ */}
                <g transform="translate(65, 35)">
                    <rect x={0} y={0} width={18} height={24} rx={4} fill="url(#goldGrad)" />
                    <line
                        x1={0}
                        y1={8}
                        x2={18}
                        y2={8}
                        stroke="#ca8a04"
                        strokeWidth={1}
                        opacity="0.8"
                    />
                    <line
                        x1={0}
                        y1={16}
                        x2={18}
                        y2={16}
                        stroke="#ca8a04"
                        strokeWidth={1}
                        opacity="0.8"
                    />
                    <line
                        x1={9}
                        y1={0}
                        x2={9}
                        y2={24}
                        stroke="#ca8a04"
                        strokeWidth={1}
                        opacity="0.8"
                    />
                    <rect
                        x={4}
                        y={6}
                        width={10}
                        height={12}
                        rx={2}
                        fill="none"
                        stroke="#ca8a04"
                        strokeWidth={1}
                    />
                </g>
                {/* Biểu tượng Contactless */}
                <g
                    transform="translate(125, 38)"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={2}
                    strokeLinecap="round"
                    opacity="0.6"
                >
                    <path d="M 0 0 A 8 8 0 0 1 0 16" />
                    <path d="M 6 -4 A 14 14 0 0 1 6 20" />
                    <path d="M 12 -8 A 20 20 0 0 1 12 24" />
                </g>
                <text
                    x={140}
                    y={170}
                    fontFamily="'Montserrat', sans-serif"
                    fontSize={8}
                    fontWeight={900}
                    fontStyle="italic"
                    fill="#ffffff"
                    opacity="0.5"
                    textAnchor="end"
                >
                    CASHBACK
                </text>
            </g>
            {/* LỚP QUỸ ĐẠO PHÍA TRƯỚC (Nửa vòng elip nổi bật) */}
            <g filter="url(#shadow)">
                {/* Đường vòng tròn sáng phía trước vắt ngang thẻ */}
                <path
                    d="M 180 100 A 80 35 0 0 1 20 100"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={5}
                    strokeLinecap="round"
                />
                {/* Đầu mũi tên tĩnh hiển thị rõ ràng */}
                <polygon points="20,85 12,102 28,102" fill="#ffffff" />
                {/* Chữ $ lớn ở trung tâm (Có animation nhịp thở lên xuống và phóng to) */}
                <text
                    className="dollar-anim"
                    x={100}
                    y={118}
                    fontFamily="'Montserrat', sans-serif"
                    fontWeight={900}
                    fontSize={52}
                    fill="url(#goldGrad)"
                    textAnchor="middle"
                >
                    $
                </text>
            </g>
            {/* Các ngôi sao lấp lánh (Sparkles) kèm animation */}
            <path
                className="sparkle sp-1"
                d="M 135 65 Q 135 75 145 75 Q 135 75 135 85 Q 135 75 125 75 Q 135 75 135 65 Z"
                fill="#fde047"
                filter="url(#glow)"
            />
            <path
                className="sparkle sp-2"
                d="M 60 120 Q 60 126 66 126 Q 60 126 60 132 Q 60 126 54 126 Q 60 126 60 120 Z"
                fill="#ffffff"
                filter="url(#glow)"
            />
            <path
                className="sparkle sp-3"
                d="M 100 30 Q 100 36 106 36 Q 100 36 100 42 Q 100 36 94 36 Q 100 36 100 30 Z"
                fill="#ffffff"
                filter="url(#glow)"
            />
        </svg>
    );
};
