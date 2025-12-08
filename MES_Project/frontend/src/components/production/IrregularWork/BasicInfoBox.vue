<script setup></script>

<template>
    <div class="basic-info-card p-5">
        <div class="header-section flex justify-between items-center mb-5 pb-2 border-b-2 border-b-gray-300">
            <h5 class="text-xl font-bold text-gray-800">기본 정보</h5>
        </div>

        <div class="form-grid grid grid-cols-2 bg-white border-t-4 border-yellow-500">
            <div class="grid-row border-b border-r">
                <label class="label-col">공정유형</label>
                <div class="input-col">
                    <input type="text" readonly class="input-readonly" />
                </div>
            </div>

            <div class="grid-row border-b">
                <label class="label-col">제품명</label>
                <div class="input-col">
                    <input type="text" readonly class="input-readonly" />
                </div>
            </div>

            <div class="grid-row border-r">
                <label class="label-col">생산계획</label>
                <div class="input-col">
                    <input type="text" readonly class="input-readonly" />
                </div>
            </div>
            <div class="grid-row border-b">
                <label class="label-col">작업자</label>
                <div class="input-col">
                    <input type="text" readonly class="input-readonly" />
                </div>
            </div>

            <div class="grid-row border-r">
                <label class="label-col">작업일자</label>
                <div class="input-col">
                    <input type="text" readonly class="input-readonly" />
                </div>
            </div>
            <div class="grid-row border-b">
                <label class="label-col">시작일시</label>
                <div class="input-col">
                    <input type="text" readonly class="input-readonly" />
                </div>
            </div>

            <div class="grid-row border-r">
                <label class="label-col">종료일시</label>
                <div class="input-col">
                    <input type="text" readonly class="input-readonly" />
                </div>
            </div>
            <div class="grid-row border-b">
                <label class="label-col">비고</label>
                <div class="input-col">
                    <input type="text" readonly class="input-readonly" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.basic-info-card {
    background-color: #fff;
    border-radius: 7px;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
}
.grid-row {
    display: grid;
    grid-template-columns: 130px 1fr;
    min-height: 45px;
}
.label-col {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f0f0f0;
    font-weight: 600;
}
.input-col {
    display: flex;
    align-items: center;
    padding: 6px 12px;
}
.input-readonly {
    width: 100%;
    border: 1px solid #d1d5db;
    padding: 4px 8px;
    border-radius: 4px;
    background-color: #f9f9f9;
}
</style>
