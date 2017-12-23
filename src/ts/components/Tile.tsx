import * as React from 'react';

export enum Type {
    FOOD,
    PLAYER,
    EMPTY
}

interface Props {
    state: Type
}

export default class Tile extends React.Component<any, object> {
    defaultStyle = {
        width: "20px",
        height: "20px",
        margin: "0px",
        display: "inline-block"
    }
    
    constructor(props: object) {
        super(props);
    }

    getStateStyle(): object {
        switch (this.props.type) {
            case Type.EMPTY:
                return { backgroundColor: "black" };
            case Type.PLAYER:
                return { backgroundColor: "orange", boxShadow: "0px 0px 30px white" };
            case Type.FOOD:
                return { backgroundColor: "darkgreen" };
        }
    }

    render() {
        return (
            <div style={{...this.defaultStyle, ...this.getStateStyle()}}>
            </div>
        );
    }
}