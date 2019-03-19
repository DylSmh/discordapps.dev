import React, { Component } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import Locations from '../../data/Locations';
import { getMasterLanguage } from '../../locales';
import { fetchCategoriesIfNeeded } from '../../redux/actions/categories';
import BotCollection from '../BotCollection';
import ContentBox from '../ContentBox';
import LocalisedHyperlink from '../LocalisedHyperlink';
import styles from './index.module.scss';



class CategoryCollection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      bots: []
    }
  }
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchCategoriesIfNeeded());

    fetch(`${Locations.server}/reactjs/v1/bots`)
      .then(res => res.json())
      .then((data) => {
        if (data.ok) {
          this.setState({
            bots: data.data
              .filter(bot => bot.state === 'approved')
              .map(bot => {
                if (bot.contents.some(contents => contents.locale === this.props.intl.locale || contents.locale === getMasterLanguage(this.props.intl.locale))) {
                  bot.random += 10;
                }
                return bot;
              })
              .sort((a, b) => b.random - a.random)
          })
        }
      });
  }
  render() {
    const categories = this.props.categories.data
    const { bots } = this.state
    return (
      <div>
        {
          categories
            // List categories that are not empty
            .filter(category => bots.filter(bot => bot.category === category).length)
            .map(category => {
              const botsInCategory = bots
                .filter(bot => bot.category === category)
              return (
                <ContentBox key={category}>
                  <div className={styles.heading}>
                    <h4 className={styles.grow} id={category}>
                      <LocalisedHyperlink to="/bots/filter" query={{
                        category
                      }}>
                        <FormattedMessage id={`categories.${category}`} />
                      </LocalisedHyperlink>
                    </h4>
                    { botsInCategory.length > 8 ?
                      <LocalisedHyperlink to="/bots/filter" query={{
                        category
                      }}>
                        <FormattedMessage id="components.categorycollection.morebots" />
                      </LocalisedHyperlink> :
                      null
                    }
                  </div>
                  <BotCollection bots={botsInCategory} limit={8} />
                </ContentBox>
              )
            })
        }
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  const { categories } = state;
  return { categories };
}

export default connect(mapStateToProps)(injectIntl(CategoryCollection));
