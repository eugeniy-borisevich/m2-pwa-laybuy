import React, {useState} from "react";
import { useProduct } from '@magento/peregrine/lib/talons/RootComponents/Product/useProduct';
import mapProduct from '@magento/venia-ui/lib/util/mapProduct';
import { useIntl } from 'react-intl';
import patches from '@magento/peregrine/lib/util/intlPatches';
import defaultClasses from '../laybuy.css';
import { useStyle } from '@magento/venia-ui/lib/classify';
import { Info as InfoIcon, X as CloseIcon } from 'react-feather';
import Icon from "@magento/venia-ui/lib/components/Icon";
import ReactModal from 'react-modal';
ReactModal.setAppElement('#root');

const LaybuyProductBadge = () => {
    const classes = useStyle(defaultClasses);
    const talonProps = useProduct({
        mapProduct
    });
    const { product } = talonProps;
    const price_part_value = product.price.regularPrice.amount.value/6;
    const price_part_currency = product.price.regularPrice.amount.currency;
    const logo_url = 'https://integration-assets.laybuy.com/magento1_laybuy/logo/small.svg';
    const popup_url = 'https://popup.laybuy.com/';
    const { locale } = useIntl();
    const parts = patches.toParts.call(
        new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: price_part_currency
        }),
        price_part_value
    );

    const children = parts.map((part, i) => {
        const key = `${i}-${part.value}`;

        return (
            <span key={key} >
                {part.value}
            </span>
        );
    });

    const customStyles = {
        overlay: {
            zIndex: '100000',
        },
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            height: '585px',
            maxWidth: '620px',
        }
    };

    const [modalIsOpen, setIsOpen] = useState(false);

    function openModal() {
        setIsOpen(true);
    }

    function afterOpenModal() {
        // references are now sync'd and can be accessed.
        //subtitle.style.color = '#f00';
    }

    function closeModal() {
        setIsOpen(false);
    }

    return (
        <div>
            <div className={classes.laybuyBadge}>
                <div>
                    or 6 interest-free payments of <b>{children}</b>
                    <img className={classes.laybuyInstallmentsAmount} src={logo_url}/>
                    <a className={classes.laybuyInfo} onClick={openModal}><Icon src={InfoIcon} /></a>
                </div>

                <ReactModal
                    isOpen={modalIsOpen}
                    contentLabel="Minimal Modal Example"
                    style={customStyles}
                >
                    <a onClick={closeModal}><Icon src={CloseIcon} /></a>
                    <iframe width="100%" height="90%" frameBorder="none" src={popup_url}></iframe>
                </ReactModal>
            </div>
        </div>
    );
};

export default LaybuyProductBadge;
