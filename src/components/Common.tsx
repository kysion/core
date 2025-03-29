import React from 'react';

export const Common = {
    isValidElement<T>(element: any) {
        return (
            React.isValidElement<T>(element) ||
            element instanceof Element ||
            element.$$typeof?.toString().includes('react.element') >= 0
        );
    },
};
