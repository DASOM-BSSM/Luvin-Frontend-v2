import { ChangeEvent, useState } from 'react';
import '../groups/create.css';

export default function CreateGroupPage() {
    const [memberCount, setMemberCount] = useState<string>('');

    const handleMemberCountChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '' || Number(value) >= 0) {
            setMemberCount(value);
        }
    };

    return (
        <div
            className="w-[402px] h-[874px] mx-auto flex flex-col font-sans antialiased overflow-hidden box-border"
            style={{ background: 'var(--default-color-bg, #FFFEFA)' }}
        >
            <div className="flex-1 flex flex-col w-full px-[30px]">
                <div className="flex-1 flex flex-col">

                    <div className="flex flex-row items-center gap-1 mt-[60px] mb-[60px] cursor-pointer">
                        <div className="w-6 h-6 aspect-square inline-flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M13.6469 7.14581L9.14688 11.6458C9.05315 11.7396 9.00049 11.8667 9.00049 11.9993C9.00049 12.1319 9.05315 12.259 9.14688 12.3528L13.6469 16.8528C13.7412 16.9439 13.8675 16.9943 13.9986 16.9931C14.1297 16.992 14.2551 16.9394 14.3478 16.8467C14.4405 16.754 14.4931 16.6286 14.4942 16.4975C14.4954 16.3664 14.445 16.2401 14.3539 16.1458L10.2069 11.9998L14.3539 7.85381C14.4476 7.76004 14.5003 7.63289 14.5003 7.50031C14.5003 7.36773 14.4476 7.24057 14.3539 7.14681C14.2601 7.05307 14.133 7.00041 14.0004 7.00041C13.8678 7.00041 13.7406 7.05207 13.6469 7.14581Z"
                                    fill="#1D1D1D"
                                />
                            </svg>
                        </div>
                        <h1 className="font-yde font-bold text-[16px] text-[#1D1D1D] leading-[160%]">
                            그룹 만들기
                        </h1>
                    </div>

                    <div className="mb-6">
                        <label className="block font-yde font-bold text-[14px] text-[#1D1D1D] leading-[160%] mb-2">
                            그룹 이름
                        </label>
                        <input
                            type="text"
                            placeholder="그룹 이름을 작성해주세요"
                            className="flex h-[35px] p-[12px] items-center gap-[10px] w-full rounded-[8px] border border-[#D9D9D9] bg-white text-gray-800 focus:outline-none focus:border-[#FFED9E] font-yde font-light text-[12px] placeholder-[#647F8B]"
                        />
                    </div>

                    <div className="mb-6">
                        <div className="flex flex-row items-center gap-2 mb-2">
                            <span className="font-yde font-bold text-[14px] text-[#1D1D1D] leading-[160%]">
                                그룹 인원수
                            </span>
                            <span className="font-yde font-light text-[14px] text-[var(--text-color-secondary,#334655)] leading-[160%]">
                                2~6명
                            </span>
                        </div>
                        <input
                            type="number"
                            min="2"
                            max="6"
                            value={memberCount}
                            onChange={handleMemberCountChange}
                            placeholder="총 인원수를 적어주세요"
                            className="flex h-[35px] p-[12px] items-center gap-[10px] w-full rounded-[8px] border border-[#D9D9D9] bg-white text-gray-800 focus:outline-none focus:border-[#FFED9E] font-yde font-light text-[12px] placeholder-[#647F8B]"
                        />
                    </div>

                    <div className="mb-[40px]">
                        <label className="block font-yde font-bold text-[14px] text-[#1D1D1D] leading-[160%] mb-2">
                            그룹장 닉네임
                        </label>
                        <input
                            type="text"
                            placeholder="자신의 닉네임을 설정해주세요"
                            className="flex h-[35px] p-[12px] items-center gap-[10px] w-full rounded-[8px] border border-[#D9D9D9] bg-white text-gray-800 focus:outline-none focus:border-[#FFED9E] font-yde font-light text-[12px] placeholder-[#647F8B]"
                        />
                    </div>

                    <div>
                        <button className="flex py-[8px] px-[10px] justify-center items-center gap-[10px] w-full rounded-[8px] bg-[#FFED9E] font-yde font-normal text-[16px] text-[#1D1D1D] border-none cursor-pointer active:opacity-85">
                            그룹 만들기
                        </button>
                    </div>
                </div>

                <div className="flex py-[16px] px-[30px] justify-between items-center rounded-[24px] bg-[#FFFCF0] mt-auto mb-[44px] mx-[7px]">
                    <div className="w-6 h-6 aspect-square flex items-center justify-center cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" fill="#E8CFBD" />
                        </svg>
                    </div>

                    <div className="w-6 h-6 aspect-square flex items-center justify-center cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M3 6.25C3 5.38805 3.34241 4.5614 3.9519 3.9519C4.5614 3.34241 5.38805 3 6.25 3H17.75C18.612 3 19.4386 3.34241 20.0481 3.9519C20.6576 4.5614 21 5.38805 21 6.25V8.5H3V6.25ZM8 7C8.26522 7 8.51957 6.89464 8.70711 6.70711C8.89464 6.51957 9 6.26522 9 6C9 5.73478 8.89464 5.48043 8.70711 5.29289C8.51957 5.10536 8.26522 5 8 5C7.73478 5 7.48043 5.10536 7.29289 5.29289C7.10536 5.48043 7 5.73478 7 6C7 6.26522 7.10536 6.51957 7.29289 6.70711C7.48043 6.89464 7.73478 7 8 7ZM13 6C13 5.73478 12.8946 5.48043 12.7071 5.29289C12.5196 5.10536 12.2652 5 12 5C11.7348 5 11.4804 5.10536 11.2929 5.29289C11.1054 5.48043 11 5.73478 11 6C11 6.26522 11.1054 6.51957 11.2929 6.70711C11.4804 6.89464 11.7348 7 12 7C12.2652 7 12.5196 6.89464 12.7071 6.70711C12.8946 6.51957 17 6.26522 17 6C17 5.73478 16.8946 5.48043 16.7071 5.29289C16.5196 5.10536 16.2652 5 16 5C15.7348 5 15.4804 5.10536 15.2929 5.29289C15.1054 5.48043 15 5.73478 15 6C15 6.26522 15.1054 6.51957 15.2929 6.70711C15.4804 6.89464 15.7348 7 16 7C16.2652 7 16.5196 6.89464 16.7071 6.70711C16.8946 6.51957 17 6.26522 17 6ZM3 17.75V10H21V17.75C21 18.612 20.6576 19.4386 20.0481 20.0481C19.4386 20.6576 18.612 21 17.75 21H6.25C5.38805 21 4.5614 20.6576 3.9519 20.0481C3.34241 19.4386 3 18.612 3 17.75ZM7.25 12C6.56 12 6 12.56 6 13.25V16.75C6 17.44 6.56 18 7.25 18H16.75C17.44 18 18 17.44 18 16.75V13.25C18 12.56 17.44 12 16.75 12H7.25Z"
                                fill="#E8CFBD"
                            />
                        </svg>
                    </div>

                    <div className="w-6 h-6 aspect-square flex items-center justify-center cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M14.15 11.3C14.7851 11.3 15.3 10.7851 15.3 10.15C15.3 9.51487 14.7851 9 14.15 9C13.5149 9 13 9.51487 13 10.15C13 10.7851 13.5149 11.3 14.15 11.3Z"
                                fill="#522D13"
                            />
                            <path
                                d="M10.15 11.3C10.7851 11.3 11.3 10.7851 11.3 10.15C11.3 9.51487 10.7851 9 10.15 9C9.51487 9 9 9.51487 9 10.15C9 10.7851 9.51487 11.3 10.15 11.3Z"
                                fill="#522D13"
                            />
                            <path
                                d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM16.41 13.89C16.3267 13.8378 16.2339 13.8025 16.137 13.7863C16.04 13.7701 15.9408 13.7732 15.845 13.7955C15.7493 13.8178 15.6589 13.8589 15.5791 13.9163C15.4993 13.9737 15.4316 14.0463 15.38 14.13C14.64 15.3 13.38 16 12 16C10.62 16 9.36 15.3 8.62 14.12C8.51524 13.9516 8.34787 13.8317 8.15471 13.7867C7.96154 13.7417 7.75841 13.7752 7.59 13.88C7.42159 13.9848 7.30169 14.1521 7.25668 14.3453C7.21167 14.5385 7.24524 14.7416 7.35 14.91C8.37 16.54 10.1 17.5 12 17.5C13.9 17.5 15.63 16.53 16.65 14.92C16.87 14.57 16.76 14.11 16.41 13.89Z"
                                fill="#522D13"
                            />
                        </svg>
                    </div>

                    <div className="w-6 h-6 aspect-square flex items-center justify-center cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M14.1941 2.8851C16.4941 2.5861 18.6521 3.0951 19.8391 4.2821C20.6291 5.0731 21.0191 5.9931 20.9991 7.0021C20.9821 7.9631 20.5941 8.8961 20.0611 9.7661C19.2991 11.0111 18.1091 12.3291 16.7911 13.6811L16.0621 14.4211L14.4461 16.0381L13.7551 16.7201C12.3771 18.0661 11.0331 19.2861 9.7661 20.0611C8.8961 20.5941 7.9631 20.9811 7.0021 21.0001C5.9931 21.0201 5.0731 20.6301 4.2821 19.8391C3.0951 18.6521 2.5861 16.4951 2.8851 14.1941C3.1921 11.8341 4.3561 9.1591 6.7571 6.7571C9.1591 4.3571 11.8351 3.1921 14.1941 2.8851ZM5.6911 11.6651C5.35114 12.3928 5.10194 13.1596 4.9491 13.9481C5.36976 14.3088 5.8671 14.5854 6.4411 14.7781C6.69279 14.862 6.96751 14.8426 7.20484 14.7239C7.44217 14.6053 7.62265 14.3973 7.7066 14.1456C7.79054 13.8939 7.77106 13.6192 7.65244 13.3819C7.53382 13.1445 7.32579 12.964 7.0741 12.8801C6.4071 12.6581 5.9621 12.2681 5.6911 11.6641V11.6651ZM8.6911 7.6791C8.18748 8.13371 7.71757 8.62434 7.2851 9.1471C7.4791 9.3981 7.6911 9.6361 7.9061 9.8511C8.4911 10.4351 9.2391 10.9961 9.9761 11.2411C10.2183 11.3229 10.4827 11.3088 10.7149 11.2017C10.9471 11.0946 11.1294 10.9026 11.2244 10.6652C11.3194 10.4278 11.3199 10.1631 11.2257 9.92535C11.1315 9.68764 10.9499 9.49502 10.7181 9.3871L10.6091 9.3441C10.2861 9.2371 9.7971 8.9141 9.3211 8.4371C9.08664 8.20579 8.87562 7.95189 8.6911 7.6791ZM13.1111 5.1491C12.4931 5.3271 11.8521 5.5791 11.2041 5.9171C11.7241 6.7641 12.5031 7.3691 13.5121 7.7061C13.6372 7.74968 13.7696 7.76798 13.9018 7.75995C14.034 7.75191 14.1633 7.7177 14.2822 7.6593C14.401 7.60089 14.5071 7.51946 14.5942 7.41973C14.6814 7.31999 14.7478 7.20394 14.7897 7.07832C14.8317 6.95269 14.8482 6.81999 14.8384 6.68791C14.8286 6.55584 14.7927 6.42702 14.7327 6.30894C14.6728 6.19086 14.5899 6.08587 14.4891 6.00007C14.3882 5.91426 14.2713 5.84935 14.1451 5.8091C13.7111 5.6641 13.3711 5.4491 13.1111 5.1491Z"
                                fill="#E8CFBD"
                            />
                        </svg>
                    </div>
                </div>

            </div>
        </div>
    );
}