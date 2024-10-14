import { createI18n } from 'vue-i18n'

const messages = {
    vi: {
        attr: {
            product: {
                ProductCode: "Mã mặt hàng",
                ProductName: "Tên mặt hàng",
                LargeUnit: "Đơn vị 1",
                SmallUnit: "Đơn vị 2",
                ConversionRate: "Quy cách",
            }
        },
        ctr: {
            product: {
                code_exists: "Mã sản phẫm đã tồn tại"
            }
        },
        button: {
            search: "Tìm",
            clear: "Làm mới",
            save: "Lưu",
            cancel: "Hủy",
            back: "Quay lại",
            refresh: "Tải lại",
            add: "Thêm mới",
            confirm: "Xác nhận"
        },
        modal: {
            add_product: "Thêm mặt hàng"
        },
        title: {
            notify: "Thông báo",
            error: "Lỗi",
            confirm: "Xác nhận",
        },
        msg: {
            save_ok: "Lưu thành công"
        }
    }
}


const i18n = createI18n({
    locale: 'vi', // <--- 1
    // fallbackLocale: 'en', // <--- 2
    legacy: false, // <--- 3
    globalInjection: true, // <--- 4
    messages, // <--- 5
})


export const t = i18n.global.t
export default i18n
