import { createI18n } from 'vue-i18n'

const messages = {
    vi: {
        attr: {
            product: {
                ProductCode: "Mã mặt hàng",
                ProductName: "Tên mặt hàng",
                Expire: "HSD (Ngày)",
                Price: "Đơn giá",
                LargeUnit: "Đơn vị 1",
                SmallUnit: "Đơn vị 2",
                ConversionRate: "Quy cách",
            },
            entry: {
                EntryCode: "Mã nhập hàng",
                EntryDate: "Ngày nhập hàng",
                EntryType: "Điều chỉnh",
                ProductCode: "Mã mặt hàng",
                ProductNameLabel: "Mặt hàng",
                LargeUnitQty: "S.L(đv1)",
                SmallUnitQty: "S.L(đv2)",
                ExpiryDate: "Hạn sử dụng",
                Price: "Đơn giá",
                Qty: "Tổng SL",
                PriceQty: "Tổng tiền",
            },
            exit: {
                ExitCode: "Mã xuất kho",
                ExitDate: "Ngày xuất kho",
                ExitType: "Điều chỉnh",
                ProductCode: "Mã mặt hàng",
                ProductNameLabel: "Mặt hàng",
                LargeUnitQty: "S.Lượng(đv1)",
                SmallUnitQty: "S.Lượng(đv2)",
            },
            inventory: {
                ProductCode: "Mã MH",
                ProductName: "Tên mặt hàng",
                ExpiryDate: "Hạn sử dụng",
                ExpireCount: "HSD(ngày)",
                ExpirePercent: "Phần trăm HSD",
                LargeUnitQty: "S.L(đv1)",
                SmallUnitQty: "S.L(đv2)",
                Qty: "Tổng SL",
                Price: "Đơn giá",
                QtyPrice: "Tổng tiền",
            },
        },
        ctr: {
            product: {
                code_exists: "Mã sản phẩm đã tồn tại",
                code_not_exists: "Mã sản phẩm không tồn tại",
                not_have_conversion_rate: "Mã sản phẩm không có đơn vị 2",
                no_product: "Không thấy sản phẩm nào",
            },
            entry: {
                code_exists: "Mã nhập kho đã tồn tại",
                no_entry: "Thêm mặt hàng để nhập kho",
            },
            exit: {
                code_exists: "Mã xuất kho đã tồn tại",
                no_exit: "Thêm mặt hàng để xuất kho",
                code_not_exists: "Mặt hàng không có trong kho",
                many_qty: "Mặt hàng này không đủ số lượng",
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
            confirm: "Xác nhận",
            add_item: "Thêm",
            import: "Thêm file",
            reset: "Dọn sạch",
            delete: "Xóa bỏ",
        },
        modal: {
            add_product: "Thêm mặt hàng",
            add_entry: "Nhập kho",
            add_exit: "Xuất kho",
            detail_product: "Chi tiết mặt hàng",
        },
        title: {
            notify: "Thông báo",
            error: "Lỗi",
            confirm: "Xác nhận",
        },
        msg: {
            save_ok: "Lưu thành công",
            delete_product: "Xác nhận xóa mặt hàng [{ProductCode}] {ProductName}"
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
