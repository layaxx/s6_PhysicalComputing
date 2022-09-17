#define __AVR_ATmega328P__ // Suppress errors in VS Code

#include <avr/io.h>
#include <util/delay.h>
#include "i2c.h"

// initialize I2C communication
static inline void I2C_init(void)
{
    TWSR = 0;  // no prescaler
    TWBR = 72; // set clock to 100kHz
}

// wait for I2C transition to finish
static inline void I2C_wait(void)
{
    while (!(TWCR & (1 << TWINT)))
        ; // wait until start is sent
}

// send I2C stop condition and wait
static inline void I2C_stop(void)
{
    TWCR = (1 << TWINT) | (1 << TWEN) | (1 << TWSTO);
    while (TWCR & (1 << TWSTO))
        ;
}

static inline void I2C_start(void)
{
    TWCR = (1 << TWINT) | (1 << TWSTA) | (1 << TWEN); // send start condition
    I2C_wait();                                       // wait until start is sent
}

// send a sequence of byte
void I2C_send(uint8_t address, unsigned char *data, uint8_t bytes_to_write)
{
    I2C_start();
    TWDR = address;
    TWCR = (1 << TWINT) | (1 << TWEN);
    I2C_wait();
    for (uint8_t i = bytes_to_write; i > 0; i--)
    {
        TWDR = *data++;
        TWCR = (1 << TWINT) | (1 << TWEN);
        I2C_wait();
    }
    I2C_stop();
}

// convenience method for writing data to a single register in an I2C device
void I2C_poke(uint8_t address, uint8_t reg, uint8_t value)
{
    uint8_t data[2];
    data[0] = reg;
    data[1] = value;
    I2C_send(address, data, 2);
}

// retrieve a sequence of bytes from an I2C device
void I2C_read_registers(uint8_t address, uint8_t start_register, uint8_t *data, uint8_t bytes_to_read)
{
    // send start
    I2C_start();
    // address chip for writing
    TWDR = address;
    TWCR = (1 << TWINT) | (1 << TWEN);
    I2C_wait(); // wait until start is sent
    // send register
    TWDR = start_register;
    TWCR = (1 << TWINT) | (1 << TWEN);
    I2C_wait();

    // send restart
    I2C_start();

    // address chip for reading
    TWDR = address | 1; // master read
    TWCR = (1 << TWINT) | (1 << TWEN);
    I2C_wait(); // wait until start is sent
    // read data
    for (uint8_t i = bytes_to_read - 1; i > 0; i--)
    {
        TWCR = (1 << TWINT) | (1 << TWEN) | (1 << TWEA);
        I2C_wait();
        *data++ = TWDR;
    }
    TWCR = (1 << TWINT) | (1 << TWEN);
    I2C_wait();
    *data = TWDR;
    I2C_stop();
}
