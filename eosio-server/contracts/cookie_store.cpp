#include <eosio.token/eosio.token.hpp>
#include <eosiolib/eosio.hpp>
#include <eosiolib/asset.hpp>

class cookie_store : public eosio::contract {

  public:
    cookie_store( account_name s ) : contract( s ), _directory_records( s, s ), _bids_records( s, s ), _used_ids_records( s, s ) { }

    ///@abi action
    void directory_create( account_name advertiser, public_key public_key ) {
       eosio_assert( _directory_records.find( advertiser ) == _directory_records.end(), "Record already exists" );

       _directory_records.emplace( get_self(), [&]( auto& rcrd ) {
         rcrd.advertiser = advertiser;
         rcrd.public_key = public_key;
       });
    }

    ///@abi action
    public_key directory_retrieve( account_name advertiser ) {
      auto itr = _directory_records.find( advertiser );
      eosio_assert( itr != _directory_records.end(), "Record does not exist" );
     
     return itr->public_key;
    }

    ///@abi action
    void directory_remove( account_name advertiser ) {
      auto itr = _directory_records.find( advertiser );
      eosio_assert( itr != _directory_records.end(), "Record does not exist" );
      
      _directory_records.erase( itr );
    }

    ///@abi action
    void bids_create( uint64_t uuid, account_name bidder, account_name desired_link, eosio::asset bounty, eosio::asset price_per ) {
       eosio_assert( _bids_records.find( uuid ) == _bids_records.end(), "Record already exists" );

       _bids_records.emplace( get_self(), [&]( auto& rcrd ) {
         rcrd.uuid = uuid;
         rcrd.bidder = bidder;
         rcrd.desired_link = desired_link;
         rcrd.bounty = bounty;
         rcrd.price_per = price_per;
       });
    }

    ///@abi action
    void bids_update( uint64_t uuid, account_name browser ) {
      auto itr = _bids_records.find( uuid );
      eosio_assert( itr != _bids_records.end(), "Record does not exist" );

      _bids_records.modify( itr, get_self(), [&]( auto& rcrd ){
        eosio_assert( rcrd.bounty >= rcrd.price_per, "Insufficient funds in bounty" );
        rcrd.bounty -= rcrd.price_per;
        INLINE_ACTION_SENDER( eosio::token, transfer )( N(eosio.token), {{get_self(),N(active)},{browser,N(active)}},
         { get_self(), browser, rcrd.price_per, std::string("Bounty payment") } );
      });
    }

    ///@abi action
    void bids_remove( uint64_t uuid ) {
      auto itr = _bids_records.find( uuid );
      eosio_assert( itr != _bids_records.end(), "Record does not exist" );
      
      _bids_records.erase( itr );
    }

    ///@abi action
    void used_ids_create( uint64_t uuid, uint64_t bounty_id, std::string id ) { 
      eosio_assert( _used_ids_records.find( uuid ) == _used_ids_records.end(), "Record already exists" );

      _used_ids_records.emplace( get_self(), [&]( auto& rcrd ) {
        rcrd.uuid = uuid;
        rcrd.bounty_uuid = uuid;
        rcrd.id = id;
      });
    }
    
  private:
    /// @abi table directory_records
    struct directory_record {
      account_name advertiser; // primary key
      uint64_t phone;
      public_key public_key;

      uint64_t primary_key() const { return advertiser; }
      uint64_t by_phone() const { return phone; }
    };

    typedef eosio::multi_index<N(records), directory_record, eosio::indexed_by<N(byphone), eosio::const_mem_fun<directory_record, uint64_t, &directory_record::by_phone> > > directory_record_table;

    directory_record_table _directory_records;

    /// @abi table bids_records
    struct bids_record {
      uint64_t uuid; // primary key
      account_name bidder;
      account_name desired_link;
      eosio::asset bounty;
      eosio::asset price_per;

      uint64_t primary_key() const { return uuid; }
      uint64_t by_bidder() const { return bidder; }
    };

    typedef eosio::multi_index<N(records), bids_record, eosio::indexed_by<N(bybidder), eosio::const_mem_fun<bids_record, uint64_t, &bids_record::by_bidder> > > bids_record_table;

    bids_record_table _bids_records;

    struct used_ids_record {
      uint64_t uuid;
      uint64_t bounty_uuid;
      std::string id;

      uint64_t primary_key() const { return uuid; }
      uint64_t by_bounty_uuid() const { return bounty_uuid; }
    };

    typedef eosio::multi_index<N(records), used_ids_record, eosio::indexed_by<N(bybidderuuid), eosio::const_mem_fun<used_ids_record, uint64_t, &used_ids_record::by_bounty_uuid> > > used_ids_record_table;

    used_ids_record_table _used_ids_records;
};

EOSIO_ABI( cookie_store, (directory_create)(directory_remove)(bids_create)(bids_update)(bids_remove)(used_ids_create) )
