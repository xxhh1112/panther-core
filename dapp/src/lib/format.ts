import {BigNumber, utils} from 'ethers';
import moment from 'moment';

import {getLocale} from './i18n';
import {roundDown} from './numbers';

export function formatTime(
    date: number | null,
    options?: {style?: 'long' | 'full' | 'medium' | 'short'},
): string | null {
    if (!date) return null;
    const localDate = new Date(date);
    const style = options?.style ?? 'long';
    return (
        localDate.toLocaleDateString(getLocale(), {
            dateStyle: style,
        }) +
        ' ' +
        localDate.toLocaleTimeString(getLocale(), {
            timeStyle: style,
        })
    );
}

export function formatLongTime(date: number | null): string | null {
    return formatTime(date, {style: 'long'});
}

export function formatTimeSince(date: number | null): string {
    return moment(date).fromNow();
}

export function secondsToFullDays(sec: number): number {
    return Math.floor(sec / 60 / 60 / 24);
}

export function formatPercentage(percentage: number): string {
    const percentFormat = new Intl.NumberFormat(getLocale(), {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        // maximumSignificantDigits: 4,
        style: 'percent',
    });
    return percentFormat.format(percentage);
}

export function formatCurrency(
    value: BigNumber | null,
    options?: {decimals?: number; scale?: number},
) {
    if (!value) {
        return '';
    }
    const num = Number(utils.formatUnits(value, options?.scale ?? 18));

    const currencyFormat = new Intl.NumberFormat(getLocale(), {
        // minimumSignificantDigits: 10,
        minimumFractionDigits: 10,
        // maximumFractionDigits: 5,

        // TypeScript doesn't allow these :-(
        // roundingMode: 'floor',
        // trailingZeroDisplay: 'lessPrecision',
    });
    const formatted = currencyFormat.format(num);
    return roundDown(formatted, options?.decimals ?? 2);
    // return ethers.utils
    //     .commify()
    //     .replace(/\.0$/, '');
}

export function formatUSD(
    value: BigNumber | null,
    options?: {decimals?: number},
): string {
    return `$${formatCurrency(value, options)} USD`;
}

export function splitFloatNumber(value: string): [string, string] | [] {
    const regex = /^\d*\.?\d*$/; // matches floating points numbers
    if (!regex.test(value)) {
        return [];
    }

    const [whole, fractional] = value.split('.');

    return [whole || '0', fractional || '0'];
}

export function getFormatedFractions(amount: string): (string | undefined)[] {
    let [whole, fractional] = splitFloatNumber(amount);
    fractional = fractional?.padEnd(2, '0').substring(0, 2);
    whole = whole
        ? formatCurrency(BigNumber.from(whole), {
              decimals: 0,
              scale: 0,
          })
        : undefined;
    return [whole, fractional];
}
