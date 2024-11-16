example_prompts = ["What's the price of ETH in USD on the base network. Use get_spot_price_tool to perform this task.",
                   (
                       "You are a cryptocurrency trader. You want to trade ETH on the Base network. "
                       "Start with checking the current price of the ETH in USD on the base network. "
                       "Historical data for ETH prices is available in the prices.csv file. "
                       "The ETH column contains the price for ETH."
                       "The time column contains the time in the %Y-%m-%d %H:%M:%S %Z python datetime format."
                       "It is in the old to latest data in the row format."
                       "Use the last 5 values only."
                       "Use the prices data to compare the ETH if it declining or growing. "
                       "Calculate the percentage of growth in ETH. If the growth is more that 1%, make a purchase."
                       "Use the get_spot_price_tool and data_retriever_tool tool to answer this question."
                   )]
