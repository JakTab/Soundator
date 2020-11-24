/* Imports */
import React, { Component } from 'react';

import './FavoritesView.scss';

import configController from '../utils/configController';

import { goToFolder } from './BottomRowView';

import * as documentFunctions from '../utils/documentFunctions';

/* Globals */
var config = new configController();

class FavoritesView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            favorites: []
        }
    }

    async componentDidMount() {
        if (!config.checkIfUndefined('favoritesList')) {
            this.setState({
                favorites: config.get('favoritesList')
            });
        }
        console.log(favorites);
    }

    jumpToFolder(index) {
        goToFolder(this.state.favorites[index].value);
        documentFunctions.toggleClass('favoritesView', 'hide');
    }

    render() {
        return (
            <div id="favoritesView" className="favoritesView hide">
                <div>
                    {this.state.favorites.map((favorite, i) => (
                        <div className="favoritesContainer" onClick={() => this.jumpToFolder(i)}>
                            <a key={favorite.value} value={favorite.value}>{favorite.title}</a>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

export default FavoritesView