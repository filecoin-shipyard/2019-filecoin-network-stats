import * as React from 'react';
import bemify from '../utils/bemify';
import {Col, Grid} from './Grid';
import './MiningSummary.scss';
import ellipsify from '../utils/ellipsify';
import {connect} from 'react-redux';
import {AppState} from '../ducks/store';
import {MiningStats} from 'filecoin-network-stats-common/lib/domain/Stats';
import {secToMillis} from '../utils/time';
import FloatTimeago from './FloatTimeago';
import BigNumber from 'bignumber.js';
import ContentHeader from './ContentHeader';
import PercentageNumber from '../utils/PercentageNumber';
import Tooltip from './Tooltip';
import PowerTooltip from './PowerTooltip';
import LabelledTooltip from './LabelledTooltip';

const b = bemify('mining-summary');

export type MiningSummaryStateProps = {
  mining: MiningStats | null
  isLoading: boolean
}

export type MiningSummaryProps = MiningSummaryStateProps

export class MiningSummary extends React.Component<MiningSummaryProps> {
  render () {
    if (!this.props.mining) {
      return null;
    }

    return (
      <div>
        <ContentHeader title={this.renderTitle()} />
        <div className={b()}>
          <div className={b('left')}>
            <div className={b('main-stat')}>
              #{this.props.mining.lastBlockHeight}
            </div>
            <div className={b('label')}>
              {this.renderBlockHeightLabel()}
            </div>
          </div>
          <div className={b('right')}>
            <Grid>
              <Col transparent>
                <div className={b('sub-stat')}>
                  {ellipsify(this.props.mining.peerId || 'UNKNOWN', 20)}
                </div>
                <div className={b('label')}>
                  Peer ID
                </div>
              </Col>
              <Col transparent>
                <div className={b('sub-stat')}>
                  {ellipsify(this.props.mining.minerAddress, 20)}
                </div>
                <div className={b('label')}>
                  Miner Address
                </div>
              </Col>
            </Grid>
            <Grid noMargin>
              <Col transparent>
                <div className={b('sub-stat')}>
                  {this.props.mining.blocksInTipset}
                </div>
                <div className={b('label')}>
                  {this.renderBlocksInTipsetLabel()}
                </div>
              </Col>
              <Col transparent>
                <div className={b('sub-stat')}>
                  {PercentageNumber.create(this.props.mining.power).toDisplay(true)}
                </div>
                <div className={b('label')}>
                  {this.renderStoragePowerLabel()}
                </div>
              </Col>
              <Col transparent>
                <div className={b('sub-stat')}>
                  {new BigNumber(this.props.mining.averageBlockTime).toFixed(1)}s
                </div>
                <div className={b('label')}>
                  {this.renderAvgBlockTimeLabel()}
                </div>
              </Col>
              <Col transparent>
                <div className={b('sub-stat')}>
                  {
                    this.props.mining.lastBlockTime ?
                      <FloatTimeago date={secToMillis(this.props.mining.lastBlockTime)} /> :
                      '--'
                  }
                </div>
                <div className={b('label')}>
                  {this.renderTimeSinceLastBlockLabel()}
                </div>
              </Col>
            </Grid>
          </div>
        </div>
      </div>
    );
  }

  renderTitle () {
    const explainer = `The 'Best Block' is the block with the heaviest tipset.`;

    return (
      <LabelledTooltip tooltip={<Tooltip content={explainer} />} text="Best Block" />
    );
  }

  renderBlockHeightLabel () {
    const explainer = `Block height is the block with the highest known number.`;

    return (
      <LabelledTooltip tooltip={<Tooltip content={explainer} />} text="Block Height" inline />
    );
  }

  renderStoragePowerLabel () {
    return (
      <LabelledTooltip tooltip={<PowerTooltip />} text="Storage Power" />
    );
  }

  renderBlocksInTipsetLabel () {
    const explainer = `The number of blocks in the current best block's tipset.`;

    return (
      <LabelledTooltip tooltip={<Tooltip content={explainer} />} text={'Blocks in Tipset'} inline />
    );
  }

  renderAvgBlockTimeLabel () {
    const explainer = `The average time it takes for a miner to create a new block.`;

    return (
      <LabelledTooltip tooltip={<Tooltip content={explainer}/>} text="Avg. Block Time" inline />
    )
  }

  renderTimeSinceLastBlockLabel () {
    const explainer = `Time since a miner last created a block.`;

    return (
      <LabelledTooltip tooltip={<Tooltip content={explainer}/>} text="Time Since Last Block" inline />
    )
  }
}

function mapStateToProps (state: AppState): MiningSummaryStateProps {
  return {
    mining: state.stats.stats && state.stats.stats.mining,
    isLoading: state.stats.isLoading,
  };
}

export default connect(
  mapStateToProps,
)(MiningSummary);